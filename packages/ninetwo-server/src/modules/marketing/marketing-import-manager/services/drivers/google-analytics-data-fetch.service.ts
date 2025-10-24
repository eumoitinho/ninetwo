import { Injectable, Logger } from '@nestjs/common';

import { OAuth2ClientManagerService } from 'src/modules/connected-account/oauth2-client-manager/services/oauth2-client-manager.service';
import { type ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { type MarketingChannelWorkspaceEntity } from 'src/modules/marketing/common/standard-objects/marketing-channel.workspace-entity';

@Injectable()
export class GoogleAnalyticsDataFetchService {
  private readonly logger = new Logger(GoogleAnalyticsDataFetchService.name);

  constructor(
    private readonly oAuth2ClientManagerService: OAuth2ClientManagerService,
  ) {}

  async fetchProperties(
    marketingChannel: MarketingChannelWorkspaceEntity,
    connectedAccount: ConnectedAccountWorkspaceEntity,
    workspaceId: string,
  ): Promise<void> {
    this.logger.log(
      `Fetching Google Analytics data for channel ${marketingChannel.id} in workspace ${workspaceId}`,
    );

    const analyticsClient =
      await this.oAuth2ClientManagerService.getGoogleAnalyticsOAuth2Client(
        connectedAccount,
      );

    const accountConfig = marketingChannel.accountConfig || {};
    const propertyId = accountConfig.propertyId;

    if (!propertyId) {
      this.logger.warn(
        `No property ID configured for Google Analytics channel ${marketingChannel.id}`,
      );
      return;
    }

    try {
      // Fetch last 30 days of data
      const [response] = await analyticsClient.runReport({
        property: `properties/${propertyId}`,
        dateRanges: [
          {
            startDate: '30daysAgo',
            endDate: 'today',
          },
        ],
        dimensions: [
          { name: 'date' },
          { name: 'sessionSource' },
          { name: 'sessionMedium' },
        ],
        metrics: [
          { name: 'sessions' },
          { name: 'totalUsers' },
          { name: 'newUsers' },
          { name: 'screenPageViews' },
          { name: 'conversions' },
        ],
      });

      this.logger.log(
        `Fetched ${response.rows?.length || 0} rows from Google Analytics property ${propertyId}`,
      );

      // TODO: Store analytics data in database
      // This will be implemented in the import service
    } catch (error) {
      this.logger.error(
        `Error fetching Google Analytics data for property ${propertyId}`,
        error,
      );
      throw error;
    }
  }
}

