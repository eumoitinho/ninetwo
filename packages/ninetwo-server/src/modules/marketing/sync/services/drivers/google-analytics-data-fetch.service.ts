import { Injectable, Logger } from '@nestjs/common';
import { UserRefreshClient } from 'google-auth-library';

import { NinetwoConfigService } from 'src/engine/core-modules/ninetwo-config/ninetwo-config.service';
import { NinetwoORMGlobalManager } from 'src/engine/ninetwo-orm/ninetwo-orm-global.manager';
import { type ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { MarketingChannelSyncStatusService } from 'src/modules/marketing/common/services/marketing-channel-sync-status.service';
import { type MarketingChannelWorkspaceEntity } from 'src/modules/marketing/common/standard-objects/marketing-channel.workspace-entity';
import {
  MarketingDataStorageService,
  type AnalyticsRowData,
} from 'src/modules/marketing/sync/services/marketing-data-storage.service';

@Injectable()
export class GoogleAnalyticsDataFetchService {
  private readonly logger = new Logger(GoogleAnalyticsDataFetchService.name);

  constructor(
    private readonly ninetwoConfigService: NinetwoConfigService,
    private readonly marketingChannelSyncStatusService: MarketingChannelSyncStatusService,
    private readonly marketingDataStorageService: MarketingDataStorageService,
    private readonly twentyORMGlobalManager: NinetwoORMGlobalManager,
  ) {}

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

      const accountConfig =
        (marketingChannel.accountConfig as {
          propertyId?: string;
          propertyIds?: string[];
        }) || {};

      const propertyIds = accountConfig.propertyIds || (accountConfig.propertyId ? [accountConfig.propertyId] : []);

      if (!propertyIds || propertyIds.length === 0) {
        this.logger.warn(
          `No property IDs configured for Google Analytics channel ${marketingChannel.id}`,
        );

        return;
      }

      this.logger.log(`Processing ${propertyIds.length} properties`);

      // Process all properties
      for (const propertyId of propertyIds) {
        await this.fetchAndStorePropertyData(
          marketingChannel,
          propertyId,
          workspaceId,
        );
      }

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

  private async fetchAndStorePropertyData(
    marketingChannel: MarketingChannelWorkspaceEntity,
    propertyId: string,
    workspaceId: string,
  ): Promise<void> {
    // Remove "properties/" prefix if present
    const cleanPropertyId = propertyId.replace(/^properties\//, '');

    this.logger.log(`Fetching data for property ${cleanPropertyId}`);

    try {
      const connectedAccountRepository =
        await this.twentyORMGlobalManager.getRepositoryForWorkspace<ConnectedAccountWorkspaceEntity>(
          workspaceId,
          'connectedAccount',
          { shouldBypassPermissionChecks: true },
        );

      const connectedAccount = await connectedAccountRepository.findOne({
        where: { id: marketingChannel.connectedAccountId },
      });

      if (!connectedAccount) {
        throw new Error('Connected account not found');
      }

      // Use REST API directly with access token
      const userClient = this.createAuthClient(connectedAccount);
      const tokenResponse = await userClient.getAccessToken();
      const accessToken = tokenResponse.token;

      if (!accessToken) {
        throw new Error('Failed to get access token');
      }

      this.logger.log(`Calling GA4 Data API for property ${cleanPropertyId}...`);

      const response = await fetch(
        `https://analyticsdata.googleapis.com/v1beta/properties/${cleanPropertyId}:runReport`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
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
            ],
            metrics: [
              { name: 'sessions' },
              { name: 'activeUsers' },
              { name: 'newUsers' },
              { name: 'screenPageViews' },
              { name: 'bounceRate' },
              { name: 'averageSessionDuration' },
              { name: 'sessionConversionRate' },
              { name: 'conversions' },
            ],
          }),
        },
      );

      if (!response.ok) {
        const errorText = await response.text();

        this.logger.error(`GA4 API error ${response.status}: ${errorText}`);
        throw new Error(`GA4 API returned ${response.status}: ${errorText}`);
      }

      const data: {
        rows?: Array<{
          dimensionValues?: Array<{ value?: string }>;
          metricValues?: Array<{ value?: string }>;
        }>;
      } = await response.json();

      this.logger.log(
        `Fetched ${data.rows?.length || 0} rows from Google Analytics property ${cleanPropertyId}`,
      );

      if (!data.rows || data.rows.length === 0) {
        this.logger.warn(`No data found for property ${cleanPropertyId}`);

        return;
      }

      // Transform API response to storage format
      const analyticsRows: AnalyticsRowData[] = data.rows.map((row) => ({
        date: row.dimensionValues?.[0]?.value || '',
        propertyId: cleanPropertyId,
        sessionSource: row.dimensionValues?.[1]?.value ?? undefined,
        sessionMedium: row.dimensionValues?.[2]?.value ?? undefined,
        sessionCampaign: row.dimensionValues?.[3]?.value ?? undefined,
        deviceCategory: row.dimensionValues?.[4]?.value ?? undefined,
        country: row.dimensionValues?.[5]?.value ?? undefined,
        city: row.dimensionValues?.[6]?.value ?? undefined,
        landingPage: row.dimensionValues?.[7]?.value ?? undefined,
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
      }));

      // Store analytics data
      await this.marketingDataStorageService.storeAnalyticsData(
        marketingChannel.id,
        workspaceId,
        analyticsRows,
      );

      this.logger.log(
        `Successfully fetched and stored ${analyticsRows.length} analytics rows for property ${cleanPropertyId}`,
      );
    } catch (error) {
      this.logger.error(
        `Error fetching data for property ${cleanPropertyId}`,
        error,
      );

      throw error;
    }
  }
}
