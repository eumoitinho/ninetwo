import { Injectable, Logger } from '@nestjs/common';

import { OAuth2ClientManagerService } from 'src/modules/connected-account/oauth2-client-manager/services/oauth2-client-manager.service';
import { type ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { MarketingChannelSyncStatusService } from 'src/modules/marketing/common/services/marketing-channel-sync-status.service';
import { type MarketingChannelWorkspaceEntity } from 'src/modules/marketing/common/standard-objects/marketing-channel.workspace-entity';
import {
    MarketingDataStorageService,
    type AnalyticsRowData,
} from 'src/modules/marketing/marketing-import-manager/services/marketing-data-storage.service';

@Injectable()
export class GoogleAnalyticsDataFetchService {
  private readonly logger = new Logger(GoogleAnalyticsDataFetchService.name);

  constructor(
    private readonly oAuth2ClientManagerService: OAuth2ClientManagerService,
    private readonly marketingChannelSyncStatusService: MarketingChannelSyncStatusService,
    private readonly marketingDataStorageService: MarketingDataStorageService,
  ) {}

  async fetchProperties(
    marketingChannel: MarketingChannelWorkspaceEntity,
    connectedAccount: ConnectedAccountWorkspaceEntity,
    workspaceId: string,
  ): Promise<void> {
    this.logger.log(
      `Fetching Google Analytics data for channel ${marketingChannel.id} in workspace ${workspaceId}`,
    );

    try {
      await this.marketingChannelSyncStatusService.markAsDataFetchOngoing(
        marketingChannel.id,
        workspaceId,
      );

      const analyticsClient =
        await this.oAuth2ClientManagerService.getGoogleAnalyticsOAuth2Client(
          connectedAccount,
        );

      const accountConfig = marketingChannel.accountConfig as {
        propertyId?: string;
      } || {};

      const propertyId = accountConfig.propertyId;

      if (!propertyId) {
        this.logger.warn(
          `No property ID configured for Google Analytics channel ${marketingChannel.id}`,
        );
        return;
      }

      // Fetch last 30 days of data with all available metrics
      const [response] = await analyticsClient.runReport({
        property: propertyId,
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
          { name: 'sessionCampaignName' },
          { name: 'deviceCategory' },
          { name: 'country' },
          { name: 'city' },
          { name: 'landingPage' },
        ],
        metrics: [
          { name: 'sessions' },
          { name: 'totalUsers' },
          { name: 'newUsers' },
          { name: 'activeUsers' },
          { name: 'screenPageViews' },
          { name: 'screenPageViewsPerSession' },
          { name: 'averageSessionDuration' },
          { name: 'bounceRate' },
          { name: 'engagementRate' },
          { name: 'engagedSessions' },
          { name: 'conversions' },
          { name: 'totalRevenue' },
          { name: 'ecommercePurchases' },
          { name: 'purchaseRevenue' },
        ],
      });

      this.logger.log(
        `Fetched ${response.rows?.length || 0} rows from Google Analytics property ${propertyId}`,
      );

      // Transform API response to storage format
      const analyticsRows: AnalyticsRowData[] =
        response.rows?.map((row) => ({
          date: row.dimensionValues?.[0]?.value || '',
          propertyId,
          sessionSource: row.dimensionValues?.[1]?.value || null,
          sessionMedium: row.dimensionValues?.[2]?.value || null,
          sessionCampaign: row.dimensionValues?.[3]?.value || null,
          deviceCategory: row.dimensionValues?.[4]?.value || null,
          country: row.dimensionValues?.[5]?.value || null,
          city: row.dimensionValues?.[6]?.value || null,
          landingPage: row.dimensionValues?.[7]?.value || null,
          sessions: Number(row.metricValues?.[0]?.value) || 0,
          totalUsers: Number(row.metricValues?.[1]?.value) || 0,
          newUsers: Number(row.metricValues?.[2]?.value) || 0,
          activeUsers: Number(row.metricValues?.[3]?.value) || 0,
          screenPageViews: Number(row.metricValues?.[4]?.value) || 0,
          screenPageViewsPerSession: Number(row.metricValues?.[5]?.value) || 0,
          averageSessionDuration: Number(row.metricValues?.[6]?.value) || 0,
          bounceRate: Number(row.metricValues?.[7]?.value) || 0,
          engagementRate: Number(row.metricValues?.[8]?.value) || 0,
          engagedSessions: Number(row.metricValues?.[9]?.value) || 0,
          conversions: Number(row.metricValues?.[10]?.value) || 0,
          totalRevenue: Number(row.metricValues?.[11]?.value) || 0,
          ecommercePurchases: Number(row.metricValues?.[12]?.value) || 0,
          purchaseRevenue: Number(row.metricValues?.[13]?.value) || 0,
        })) || [];

      // Store analytics data
      await this.marketingDataStorageService.storeAnalyticsData(
        marketingChannel.id,
        workspaceId,
        analyticsRows,
      );

      this.logger.log(
        `Successfully fetched and stored ${analyticsRows.length} analytics rows`,
      );

      await this.marketingChannelSyncStatusService.markAsCompleted(
        marketingChannel.id,
        workspaceId,
      );
    } catch (error) {
      this.logger.error(
        `Error fetching Google Analytics data for channel ${marketingChannel.id}`,
        error,
      );

      await this.marketingChannelSyncStatusService.markAsFailed(
        marketingChannel.id,
        workspaceId,
      );

      throw error;
    }
  }
}


