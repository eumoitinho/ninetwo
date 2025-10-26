import { Injectable, Logger } from '@nestjs/common';

import { type ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { GoogleAnalyticsPropertyService } from 'src/modules/marketing/marketing-accounts-manager/services/google-analytics-property.service';

import { type AdAccountsResult } from 'ninetwo-marketing-core';

@Injectable()
export class GoogleAnalyticsSyncService {
  private readonly logger = new Logger(GoogleAnalyticsSyncService.name);

  constructor(
    private readonly googleAnalyticsPropertyService: GoogleAnalyticsPropertyService,
  ) {}

  async fetchProperties(
    connectedAccount: Pick<
      ConnectedAccountWorkspaceEntity,
      'provider' | 'refreshToken' | 'syncConfig'
    > & { id: string; handle: string },
  ): Promise<AdAccountsResult> {
    this.logger.log('Fetching Google Analytics properties...');

    try {
      const accountsAndProperties =
        await this.googleAnalyticsPropertyService.listAccountsAndProperties(
          connectedAccount as ConnectedAccountWorkspaceEntity,
        );

      // Flatten properties from all accounts
      const allProperties = accountsAndProperties.flatMap((account) =>
        account.properties.map((prop) => ({
          id: prop.id,
          name: prop.displayName || prop.name,
          type: 'REGULAR',
          platform: 'google-analytics',
          currencyCode: 'USD',
        })),
      );

      return {
        accounts: allProperties,
      };
    } catch (error) {
      this.logger.error('Failed to fetch Google Analytics properties', error);
      throw error;
    }
  }
}


