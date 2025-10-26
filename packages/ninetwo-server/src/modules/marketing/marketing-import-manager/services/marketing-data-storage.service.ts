import { Injectable, Logger } from '@nestjs/common';

import { NinetwoORMGlobalManager } from 'src/engine/ninetwo-orm/ninetwo-orm-global.manager';
import { type AdsCampaignWorkspaceEntity } from 'src/modules/marketing/common/standard-objects/ads-campaign.workspace-entity';
import { type AnalyticsDataWorkspaceEntity } from 'src/modules/marketing/common/standard-objects/analytics-data.workspace-entity';

export type AdsCampaignData = {
  externalId: string;
  customerId: string;
  name: string;
  status: string;
  advertisingChannelType?: string;
  budget?: number;
  impressions?: number;
  clicks?: number;
  costMicros?: number;
  conversions?: number;
  conversionValue?: number;
  ctr?: number;
  averageCpc?: number;
  startDate?: string;
  endDate?: string;
};

export type AnalyticsRowData = {
  date: string;
  propertyId: string;
  sessionSource?: string;
  sessionMedium?: string;
  sessionCampaign?: string;
  deviceCategory?: string;
  country?: string;
  city?: string;
  landingPage?: string;
  sessions?: number;
  totalUsers?: number;
  newUsers?: number;
  activeUsers?: number;
  screenPageViews?: number;
  screenPageViewsPerSession?: number;
  averageSessionDuration?: number;
  bounceRate?: number;
  engagementRate?: number;
  engagedSessions?: number;
  conversions?: number;
  totalRevenue?: number;
  ecommercePurchases?: number;
  purchaseRevenue?: number;
};

@Injectable()
export class MarketingDataStorageService {
  private readonly logger = new Logger(MarketingDataStorageService.name);

  constructor(
    private readonly twentyORMGlobalManager: NinetwoORMGlobalManager,
  ) {}

  async storeAdsCampaigns(
    marketingChannelId: string,
    workspaceId: string,
    campaignsData: AdsCampaignData[],
  ): Promise<void> {
    this.logger.log(
      `Storing ${campaignsData.length} campaigns for marketing channel ${marketingChannelId}`,
    );

    const adsCampaignRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<AdsCampaignWorkspaceEntity>(
        workspaceId,
        'adsCampaign',
      );

    for (const campaign of campaignsData) {
      // Check if campaign already exists
      const existingCampaign = await adsCampaignRepository.findOne({
        where: {
          externalId: campaign.externalId,
          marketingChannelId,
        },
      });

      // Calculate derived metrics
      const ctr =
        campaign.impressions && campaign.impressions > 0
          ? (campaign.clicks || 0) / campaign.impressions
          : null;

      const averageCpc =
        campaign.clicks && campaign.clicks > 0
          ? (campaign.costMicros || 0) / campaign.clicks
          : null;

      const averageCpa =
        campaign.conversions && campaign.conversions > 0
          ? (campaign.costMicros || 0) / campaign.conversions
          : null;

      const roas =
        campaign.costMicros && campaign.costMicros > 0
          ? (campaign.conversionValue || 0) / campaign.costMicros
          : null;

      const campaignData = {
        ...campaign,
        marketingChannelId,
        ctr,
        averageCpc,
        averageCpa,
        roas,
        lastSyncedAt: new Date(),
      };

      if (existingCampaign) {
        // Update existing campaign
        await adsCampaignRepository.update(existingCampaign.id, campaignData);
      } else {
        // Create new campaign
        await adsCampaignRepository.save(campaignData);
      }
    }

    this.logger.log(
      `Successfully stored ${campaignsData.length} campaigns`,
    );
  }

  async storeAnalyticsData(
    marketingChannelId: string,
    workspaceId: string,
    analyticsRows: AnalyticsRowData[],
  ): Promise<void> {
    this.logger.log(
      `Storing ${analyticsRows.length} analytics rows for marketing channel ${marketingChannelId}`,
    );

    const analyticsDataRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<AnalyticsDataWorkspaceEntity>(
        workspaceId,
        'analyticsData',
      );

    for (const row of analyticsRows) {
      // Create unique key for upsert (date + propertyId + dimensions)
      const uniqueKey = `${row.date}_${row.propertyId}_${row.sessionSource || ''}_${row.sessionMedium || ''}_${row.deviceCategory || ''}`;

      const existingData = await analyticsDataRepository.findOne({
        where: {
          date: row.date,
          propertyId: row.propertyId,
          marketingChannelId,
          sessionSource: row.sessionSource || undefined,
          sessionMedium: row.sessionMedium || undefined,
          deviceCategory: row.deviceCategory || undefined,
        },
      });

      const analyticsData = {
        ...row,
        marketingChannelId,
      };

      if (existingData) {
        // Update existing data (aggregate if needed)
        await analyticsDataRepository.update(existingData.id, {
          ...analyticsData,
          sessions: (existingData.sessions || 0) + (row.sessions || 0),
          totalUsers: (existingData.totalUsers || 0) + (row.totalUsers || 0),
          newUsers: (existingData.newUsers || 0) + (row.newUsers || 0),
          screenPageViews:
            (existingData.screenPageViews || 0) + (row.screenPageViews || 0),
          conversions:
            (existingData.conversions || 0) + (row.conversions || 0),
          totalRevenue:
            (existingData.totalRevenue || 0) + (row.totalRevenue || 0),
        });
      } else {
        // Create new record
        await analyticsDataRepository.save(analyticsData);
      }
    }

    this.logger.log(
      `Successfully stored ${analyticsRows.length} analytics data rows`,
    );
  }
}

