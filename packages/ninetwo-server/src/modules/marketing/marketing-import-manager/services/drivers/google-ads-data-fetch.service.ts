import { Injectable, Logger } from '@nestjs/common';

import { type GoogleAdsApi } from 'google-ads-api';

import { OAuth2ClientManagerService } from 'src/modules/connected-account/oauth2-client-manager/services/oauth2-client-manager.service';
import { type ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { MarketingChannelSyncStatusService } from 'src/modules/marketing/common/services/marketing-channel-sync-status.service';
import { type MarketingChannelWorkspaceEntity } from 'src/modules/marketing/common/standard-objects/marketing-channel.workspace-entity';
import {
  MarketingDataStorageService,
  type AdsCampaignData,
} from 'src/modules/marketing/marketing-import-manager/services/marketing-data-storage.service';

@Injectable()
export class GoogleAdsDataFetchService {
  private readonly logger = new Logger(GoogleAdsDataFetchService.name);

  constructor(
    private readonly oAuth2ClientManagerService: OAuth2ClientManagerService,
    private readonly marketingChannelSyncStatusService: MarketingChannelSyncStatusService,
    private readonly marketingDataStorageService: MarketingDataStorageService,
  ) {}

  async fetchCampaigns(
    marketingChannel: MarketingChannelWorkspaceEntity,
    connectedAccount: ConnectedAccountWorkspaceEntity,
    workspaceId: string,
  ): Promise<void> {
    this.logger.log(
      `Fetching Google Ads campaigns for channel ${marketingChannel.id} in workspace ${workspaceId}`,
    );

    try {
      await this.marketingChannelSyncStatusService.markAsDataFetchOngoing(
        marketingChannel.id,
        workspaceId,
      );

      const googleAdsClient =
        await this.oAuth2ClientManagerService.getGoogleAdsOAuth2Client(
          connectedAccount,
        );

      const accountConfig =
        (marketingChannel.accountConfig as {
          customerId?: string;
          selectedAccounts?: string[];
        }) || {};

      const customerIds = accountConfig.selectedAccounts || [
        accountConfig.customerId,
      ];

      if (!customerIds || customerIds.length === 0 || !customerIds[0]) {
        this.logger.warn(
          `No customer IDs configured for Google Ads channel ${marketingChannel.id}`,
        );

        return;
      }

      const allCampaignsData: AdsCampaignData[] = [];

      for (const customerId of customerIds.filter(Boolean)) {
        const campaigns = await this.fetchCustomerCampaigns(
          googleAdsClient,
          connectedAccount.refreshToken,
          customerId,
        );

        allCampaignsData.push(...campaigns);
      }

      // Store campaigns in database
      await this.marketingDataStorageService.storeAdsCampaigns(
        marketingChannel.id,
        workspaceId,
        allCampaignsData,
      );

      this.logger.log(
        `Successfully fetched and stored ${allCampaignsData.length} campaigns`,
      );

      await this.marketingChannelSyncStatusService.markAsCompleted(
        marketingChannel.id,
        workspaceId,
      );
    } catch (error) {
      this.logger.error(
        `Error fetching Google Ads data for channel ${marketingChannel.id}`,
        error,
      );

      await this.marketingChannelSyncStatusService.markAsFailed(
        marketingChannel.id,
        workspaceId,
      );

      throw error;
    }
  }

  private async fetchCustomerCampaigns(
    googleAdsClient: GoogleAdsApi,
    refreshToken: string,
    customerId: string | undefined,
  ): Promise<AdsCampaignData[]> {
    if (!customerId) {
      return [];
    }
    const customer = googleAdsClient.Customer({
      customer_id: customerId.replace(/-/g, ''),
      refresh_token: refreshToken,
    });

    // Fetch campaigns with complete metrics
    const query = `
      SELECT
        campaign.id,
        campaign.name,
        campaign.status,
        campaign.advertising_channel_type,
        campaign_budget.amount_micros,
        campaign.start_date,
        campaign.end_date,
        metrics.impressions,
        metrics.clicks,
        metrics.cost_micros,
        metrics.conversions,
        metrics.conversions_value,
        metrics.ctr,
        metrics.average_cpc
      FROM campaign
      WHERE campaign.status != 'REMOVED'
      AND segments.date DURING LAST_30_DAYS
    `;

    const campaignRows = await customer.query(query);

    const campaignsMap = new Map<string, AdsCampaignData>();

    // Aggregate data by campaign
    for (const row of campaignRows) {
      if (!row.campaign?.id) continue;

      const campaignId = row.campaign.id.toString();

      if (!campaignsMap.has(campaignId)) {
        campaignsMap.set(campaignId, {
          externalId: campaignId,
          customerId,
          name: row.campaign?.name || 'Unnamed Campaign',
          status: String(row.campaign?.status || 'UNKNOWN'),
          advertisingChannelType: row.campaign?.advertising_channel_type
            ? String(row.campaign.advertising_channel_type)
            : undefined,
          budget: row.campaign_budget?.amount_micros || 0,
          startDate: row.campaign?.start_date || undefined,
          endDate: row.campaign?.end_date || undefined,
          impressions: 0,
          clicks: 0,
          costMicros: 0,
          conversions: 0,
          conversionValue: 0,
          ctr: 0,
          averageCpc: 0,
        });
      }

      const campaign = campaignsMap.get(campaignId)!;

      // Aggregate metrics
      campaign.impressions =
        (campaign.impressions || 0) + (row.metrics?.impressions || 0);
      campaign.clicks = (campaign.clicks || 0) + (row.metrics?.clicks || 0);
      campaign.costMicros =
        (campaign.costMicros || 0) + (row.metrics?.cost_micros || 0);
      campaign.conversions =
        (campaign.conversions || 0) + (row.metrics?.conversions || 0);
      campaign.conversionValue =
        (campaign.conversionValue || 0) + (row.metrics?.conversions_value || 0);
    }

    // Calculate average CTR and CPC
    const campaigns = Array.from(campaignsMap.values()).map((campaign) => {
      const ctr =
        campaign.impressions && campaign.impressions > 0
          ? (campaign.clicks || 0) / campaign.impressions
          : 0;

      const averageCpc =
        campaign.clicks && campaign.clicks > 0
          ? (campaign.costMicros || 0) / campaign.clicks
          : 0;

      return {
        ...campaign,
        ctr,
        averageCpc,
      };
    });

    return campaigns;
  }
}
