import { Injectable, Logger } from '@nestjs/common';

import { GoogleAuth } from 'google-auth-library';

import { NinetwoConfigService } from 'src/engine/core-modules/ninetwo-config/ninetwo-config.service';
import { OAuth2ClientManagerService } from 'src/modules/connected-account/oauth2-client-manager/services/oauth2-client-manager.service';
import { type ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';

export type GoogleAnalyticsProperty = {
  id: string;
  name: string;
  displayName: string;
  propertyType: string;
};

export type GoogleAnalyticsAccount = {
  id: string;
  name: string;
  displayName: string;
  properties: GoogleAnalyticsProperty[];
};

@Injectable()
export class GoogleAnalyticsPropertyService {
  private readonly logger = new Logger(GoogleAnalyticsPropertyService.name);

  constructor(
    private readonly oAuth2ClientManagerService: OAuth2ClientManagerService,
    private readonly twentyConfigService: NinetwoConfigService,
  ) {}

  async listAccountsAndProperties(
    connectedAccount: ConnectedAccountWorkspaceEntity,
  ): Promise<GoogleAnalyticsAccount[]> {
    try {
      const clientId = this.twentyConfigService.get(
        'AUTH_GOOGLE_ANALYTICS_CLIENT_ID',
      );
      const clientSecret = this.twentyConfigService.get(
        'AUTH_GOOGLE_ANALYTICS_CLIENT_SECRET',
      );

      const auth = new GoogleAuth({
        credentials: {
          type: 'authorized_user',
          client_id: clientId,
          client_secret: clientSecret,
          refresh_token: connectedAccount.refreshToken,
        },
        scopes: ['https://www.googleapis.com/auth/analytics.readonly'],
      });

      const authClient = await auth.getClient();

      // Use Google Analytics Admin API to list accounts and properties
      const adminApiUrl =
        'https://analyticsadmin.googleapis.com/v1beta/accountSummaries';

      const response = await authClient.request({
        url: adminApiUrl,
      });

      const accountSummaries = (response.data as any).accountSummaries || [];

      const accounts: GoogleAnalyticsAccount[] = accountSummaries.map(
        (summary: any) => ({
          id: summary.account,
          name: summary.name,
          displayName: summary.displayName,
          properties:
            summary.propertySummaries?.map((prop: any) => ({
              id: prop.property,
              name: prop.property,
              displayName: prop.displayName,
              propertyType: prop.propertyType || 'PROPERTY_TYPE_ORDINARY',
            })) || [],
        }),
      );

      return accounts;
    } catch (error) {
      this.logger.error('Error listing Google Analytics properties', error);
      throw new Error(
        `Failed to list Google Analytics properties: ${error.message}`,
      );
    }
  }

  async getPropertyMetadata(
    connectedAccount: ConnectedAccountWorkspaceEntity,
    propertyId: string,
  ): Promise<GoogleAnalyticsProperty | null> {
    try {
      const clientId = this.twentyConfigService.get(
        'AUTH_GOOGLE_ANALYTICS_CLIENT_ID',
      );
      const clientSecret = this.twentyConfigService.get(
        'AUTH_GOOGLE_ANALYTICS_CLIENT_SECRET',
      );

      const auth = new GoogleAuth({
        credentials: {
          type: 'authorized_user',
          client_id: clientId,
          client_secret: clientSecret,
          refresh_token: connectedAccount.refreshToken,
        },
        scopes: ['https://www.googleapis.com/auth/analytics.readonly'],
      });

      const authClient = await auth.getClient();

      const adminApiUrl = `https://analyticsadmin.googleapis.com/v1beta/${propertyId}`;

      const response = await authClient.request({
        url: adminApiUrl,
      });

      const property = response.data as any;

      return {
        id: property.name,
        name: property.name,
        displayName: property.displayName,
        propertyType: property.propertyType || 'PROPERTY_TYPE_ORDINARY',
      };
    } catch (error) {
      this.logger.error(
        `Error getting property metadata for ${propertyId}`,
        error,
      );
      return null;
    }
  }
}

