import { Injectable, Logger } from '@nestjs/common';
import { UserRefreshClient } from 'google-auth-library';
import { NinetwoConfigService } from 'src/engine/core-modules/ninetwo-config/ninetwo-config.service';
import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { AdAccountsResultDto } from 'src/modules/marketing/dtos/ad-account.dto';

@Injectable()
export class GoogleAnalyticsSyncService {
  private readonly logger = new Logger(GoogleAnalyticsSyncService.name);

  constructor(private readonly ninetwoConfigService: NinetwoConfigService) {}

  private createAuthClient(
    connectedAccount: Pick<
      ConnectedAccountWorkspaceEntity,
      'provider' | 'refreshToken'
    >,
  ): UserRefreshClient {
    const clientId = this.ninetwoConfigService.get('AUTH_GOOGLE_CLIENT_ID');
    const clientSecret = this.ninetwoConfigService.get(
      'AUTH_GOOGLE_CLIENT_SECRET',
    );

    return new UserRefreshClient(
      String(clientId),
      String(clientSecret),
      connectedAccount.refreshToken,
    );
  }

  async fetchProperties(
    connectedAccount: ConnectedAccountWorkspaceEntity,
  ): Promise<AdAccountsResultDto> {
    this.logger.log('Starting Google Analytics property fetch...');

    try {
      if (!connectedAccount.refreshToken) {
        throw new Error('No refresh token available for Google Analytics');
      }

      this.logger.log('Creating auth client...');

      const userClient = this.createAuthClient(connectedAccount);

      // Force token refresh to get a valid access token
      const tokenResponse = await userClient.getAccessToken();
      const accessToken = tokenResponse.token;

      this.logger.log(`Got access token: ${accessToken ? 'YES' : 'NO'}`);

      if (!accessToken) {
        throw new Error('Failed to get access token from refresh token');
      }

      this.logger.log('Calling GA Admin API accountSummaries endpoint...');

      const res = await fetch(
        'https://analyticsadmin.googleapis.com/v1beta/accountSummaries',
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      );

      this.logger.log(`GA Admin API response status: ${res.status}`);

      if (!res.ok) {
        const body = await res.text();

        this.logger.error(`GA Admin REST error ${res.status}: ${body}`);
        throw new Error(`Failed to list account summaries: ${res.status}`);
      }

      const response: {
        accountSummaries?: Array<{
          account?: string;
          displayName?: string;
          propertySummaries?: Array<{
            property?: string;
            displayName?: string;
          }>;
        }>;
      } = await res.json();

      this.logger.log(
        `GA Admin API response:`,
        JSON.stringify(response, null, 2),
      );

      if (
        !response.accountSummaries ||
        response.accountSummaries.length === 0
      ) {
        this.logger.warn('No accessible account summaries found');
        this.logger.warn('Possible reasons:');
        this.logger.warn(
          '1. The Google account does not have access to any Google Analytics accounts',
        );
        this.logger.warn('2. The OAuth token is missing required scopes');
        this.logger.warn(
          '3. The account does not have GA4 properties (only Universal Analytics)',
        );

        return {
          accounts: [],
          selectedAccounts: [],
          managerCustomerId: undefined,
          managerAccountId: undefined,
        };
      }

      this.logger.log(
        `Found ${response.accountSummaries.length} account summaries`,
      );

      const properties: Array<{
        id: string;
        name: string;
        currency?: string;
        timezone?: string;
        type: string;
        platform: string;
      }> = [];

      response.accountSummaries.forEach((summary) => {
        const accountId = (summary.account || '').split('/')[1] || '';
        const accountName = summary.displayName || accountId;

        this.logger.log(
          `Processing account ${accountId} (${accountName}) with ${summary.propertySummaries?.length || 0} properties`,
        );

        (summary.propertySummaries || []).forEach((propSummary) => {
          const propertyId = (propSummary.property || '').split('/')[1] || '';
          const propertyName = propSummary.displayName || propertyId;

          this.logger.log(`  - Property ${propertyId} (${propertyName})`);

          properties.push({
            id: propertyId,
            name: propertyName,
            currency: undefined,
            timezone: undefined,
            type: 'analytics',
            platform: 'google',
          });
        });
      });

      this.logger.log(
        `Successfully found ${properties.length} GA4 properties total`,
      );

      return {
        accounts: properties,
        selectedAccounts: [],
        managerCustomerId: undefined,
        managerAccountId: undefined,
      };
    } catch (error) {
      this.logger.error('Failed to fetch Google Analytics properties', error);

      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      throw new Error(
        `Failed to fetch Google Analytics properties: ${errorMessage}`,
      );
    }
  }
}
