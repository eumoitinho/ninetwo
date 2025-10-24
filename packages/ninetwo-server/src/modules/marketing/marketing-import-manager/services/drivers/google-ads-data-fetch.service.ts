import { Injectable, Logger } from '@nestjs/common';

import { OAuth2ClientManagerService } from 'src/modules/connected-account/oauth2-client-manager/services/oauth2-client-manager.service';
import { type ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { type MarketingChannelWorkspaceEntity } from 'src/modules/marketing/common/standard-objects/marketing-channel.workspace-entity';

@Injectable()
export class GoogleAdsDataFetchService {
  private readonly logger = new Logger(GoogleAdsDataFetchService.name);

  constructor(
    private readonly oAuth2ClientManagerService: OAuth2ClientManagerService,
  ) {}

  async fetchCampaigns(
    marketingChannel: MarketingChannelWorkspaceEntity,
    connectedAccount: ConnectedAccountWorkspaceEntity,
    workspaceId: string,
  ): Promise<void> {
    this.logger.log(
      `Fetching Google Ads campaigns for channel ${marketingChannel.id} in workspace ${workspaceId}`,
    );

    const googleAdsClient =
      await this.oAuth2ClientManagerService.getGoogleAdsOAuth2Client(
        connectedAccount,
      );

    const accountConfig = marketingChannel.accountConfig || {};
    const customerIds = accountConfig.customerIds || [];

    if (customerIds.length === 0) {
      this.logger.warn(
        `No customer IDs configured for Google Ads channel ${marketingChannel.id}`,
      );

      return;
    }

    // Fetch campaigns from selected accounts
    for (const customerId of customerIds) {
      try {
        const customer = googleAdsClient.Customer({
          customer_id: customerId.replace(/-/g, ''),
          refresh_token: connectedAccount.refreshToken,
        });

        const campaigns = await customer.query(`
          SELECT
            campaign.id,
            campaign.name,
            campaign.status,
            campaign.advertising_channel_type,
            metrics.impressions,
            metrics.clicks,
            metrics.cost_micros,
            metrics.conversions
          FROM campaign
          WHERE segments.date DURING LAST_30_DAYS
        `);

        this.logger.log(
          `Fetched ${campaigns.length} campaigns for customer ${customerId}`,
        );

        // TODO: Store campaigns in database
        // This will be implemented in the import service
      } catch (error) {
        this.logger.error(
          `Error fetching campaigns for customer ${customerId}`,
          error,
        );
        throw error;
      }
    }
  }
}
