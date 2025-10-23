import { Injectable, Logger } from '@nestjs/common';

import { Customer, enums } from 'google-ads-api';

import { OAuth2ClientManagerService } from 'src/modules/connected-account/oauth2-client-manager/services/oauth2-client-manager.service';
import { type ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';

@Injectable()
export class CampaignManagerService {
  private readonly logger = new Logger(CampaignManagerService.name);

  constructor(
    private readonly oauth2ClientManagerService: OAuth2ClientManagerService,
  ) {}

  async pauseCampaign(
    connectedAccount: Pick<
      ConnectedAccountWorkspaceEntity,
      'provider' | 'refreshToken' | 'accessToken'
    >,
    customerId: string,
    campaignId: string,
    managerCustomerId?: string,
  ): Promise<boolean> {
    try {
      if (connectedAccount.provider === 'google-ads') {
        return await this.pauseGoogleAdsCampaign(
          connectedAccount,
          customerId,
          campaignId,
          managerCustomerId,
        );
      }

      if (connectedAccount.provider === 'meta-ads') {
        return await this.pauseMetaCampaign(connectedAccount, campaignId);
      }

      throw new Error(
        `Provider ${connectedAccount.provider} not supported for campaign management`,
      );
    } catch (error) {
      this.logger.error(`Failed to pause campaign ${campaignId}`, error);
      throw error;
    }
  }

  async activateCampaign(
    connectedAccount: Pick<
      ConnectedAccountWorkspaceEntity,
      'provider' | 'refreshToken' | 'accessToken'
    >,
    customerId: string,
    campaignId: string,
    managerCustomerId?: string,
  ): Promise<boolean> {
    try {
      if (connectedAccount.provider === 'google-ads') {
        return await this.activateGoogleAdsCampaign(
          connectedAccount,
          customerId,
          campaignId,
          managerCustomerId,
        );
      }

      if (connectedAccount.provider === 'meta-ads') {
        return await this.activateMetaCampaign(connectedAccount, campaignId);
      }

      throw new Error(
        `Provider ${connectedAccount.provider} not supported for campaign management`,
      );
    } catch (error) {
      this.logger.error(`Failed to activate campaign ${campaignId}`, error);
      throw error;
    }
  }

  private async pauseGoogleAdsCampaign(
    connectedAccount: Pick<
      ConnectedAccountWorkspaceEntity,
      'provider' | 'refreshToken'
    >,
    customerId: string,
    campaignId: string,
    managerCustomerId?: string,
  ): Promise<boolean> {
    const googleAdsClient =
      await this.oauth2ClientManagerService.getGoogleAdsOAuth2Client(
        connectedAccount,
      );

    const customer: Customer = googleAdsClient.Customer({
      customer_id: customerId,
      login_customer_id: managerCustomerId || customerId,
      refresh_token: connectedAccount.refreshToken,
    });

    await customer.campaigns.update({
      resource_name: `customers/${customerId}/campaigns/${campaignId}`,
      status: enums.CampaignStatus.PAUSED,
    });

    this.logger.log(`Paused Google Ads campaign ${campaignId}`);

    return true;
  }

  private async activateGoogleAdsCampaign(
    connectedAccount: Pick<
      ConnectedAccountWorkspaceEntity,
      'provider' | 'refreshToken'
    >,
    customerId: string,
    campaignId: string,
    managerCustomerId?: string,
  ): Promise<boolean> {
    const googleAdsClient =
      await this.oauth2ClientManagerService.getGoogleAdsOAuth2Client(
        connectedAccount,
      );

    const customer: Customer = googleAdsClient.Customer({
      customer_id: customerId,
      login_customer_id: managerCustomerId || customerId,
      refresh_token: connectedAccount.refreshToken,
    });

    await customer.campaigns.update({
      resource_name: `customers/${customerId}/campaigns/${campaignId}`,
      status: enums.CampaignStatus.ENABLED,
    });

    this.logger.log(`Activated Google Ads campaign ${campaignId}`);

    return true;
  }

  private async pauseMetaCampaign(
    connectedAccount: Pick<
      ConnectedAccountWorkspaceEntity,
      'provider' | 'accessToken'
    >,
    campaignId: string,
  ): Promise<boolean> {
    const metaAdsClient =
      await this.oauth2ClientManagerService.getMetaAdsOAuth2Client(
        connectedAccount,
      );

    await metaAdsClient.call('POST', [campaignId], {
      status: 'PAUSED',
    });

    this.logger.log(`Paused Meta Ads campaign ${campaignId}`);

    return true;
  }

  private async activateMetaCampaign(
    connectedAccount: Pick<
      ConnectedAccountWorkspaceEntity,
      'provider' | 'accessToken'
    >,
    campaignId: string,
  ): Promise<boolean> {
    const metaAdsClient =
      await this.oauth2ClientManagerService.getMetaAdsOAuth2Client(
        connectedAccount,
      );

    await metaAdsClient.call('POST', [campaignId], {
      status: 'ACTIVE',
    });

    this.logger.log(`Activated Meta Ads campaign ${campaignId}`);

    return true;
  }
}
