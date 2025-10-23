import { Injectable, Logger } from '@nestjs/common';

import { AdAccount } from 'facebook-nodejs-business-sdk';

import { OAuth2ClientManagerService } from 'src/modules/connected-account/oauth2-client-manager/services/oauth2-client-manager.service';
import { type ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';

import {
  type AdAccount as AdAccountType,
  type AdAccountsResult,
  type Campaign as CampaignType,
} from 'ninetwo-marketing-core';

@Injectable()
export class MetaAdsSyncService {
  private readonly logger = new Logger(MetaAdsSyncService.name);

  constructor(
    private readonly oauth2ClientManagerService: OAuth2ClientManagerService,
  ) {}

  async fetchAccessibleAdAccounts(
    connectedAccount: Pick<
      ConnectedAccountWorkspaceEntity,
      'provider' | 'accessToken'
    >,
  ): Promise<AdAccountsResult> {
    this.logger.log('Fetching accessible Meta Ad Accounts...');

    try {
      const api =
        await this.oauth2ClientManagerService.getMetaAdsOAuth2Client(
          connectedAccount,
        );

      // Fetch user's ad accounts
      const me = await api.call('GET', ['me', 'adaccounts'], {
        fields: ['id', 'name', 'currency', 'timezone_name', 'account_status'],
      });

      const accounts: AdAccountType[] = (me.data || []).map(
        (account: {
          id: string;
          name?: string;
          currency?: string;
          timezone_name?: string;
        }) => ({
          id: account.id,
          name: account.name || account.id,
          type: 'REGULAR' as const,
          platform: 'Meta Ads',
          currencyCode: account.currency || 'USD',
          timezone: account.timezone_name,
        }),
      );

      this.logger.log(`Found ${accounts.length} Meta ad accounts`);

      return { accounts };
    } catch (error) {
      this.logger.error('Failed to fetch Meta ad accounts', error);
      throw error;
    }
  }

  async fetchCampaigns(
    connectedAccount: Pick<
      ConnectedAccountWorkspaceEntity,
      'id' | 'provider' | 'accessToken'
    >,
    adAccountId: string,
  ): Promise<CampaignType[]> {
    try {
      await this.oauth2ClientManagerService.getMetaAdsOAuth2Client(
        connectedAccount,
      );

      const adAccount = new AdAccount(adAccountId);
      const campaigns = await adAccount.getCampaigns([], {
        fields: [
          'id',
          'name',
          'status',
          'daily_budget',
          'lifetime_budget',
          'objective',
        ],
      });

      return (campaigns || []).map(
        (campaign: {
          id: string;
          name: string;
          status: string;
          daily_budget?: string;
          lifetime_budget?: string;
        }) => ({
          id: campaign.id,
          name: campaign.name,
          platform: 'Meta Ads',
          externalId: campaign.id,
          status: campaign.status,
          dailyBudget: campaign.daily_budget
            ? parseInt(campaign.daily_budget) / 100
            : undefined,
          totalBudget: campaign.lifetime_budget
            ? parseInt(campaign.lifetime_budget) / 100
            : undefined,
          currencyCode: 'USD', // Meta returns budget in cents
          connectedAccountId: connectedAccount.id,
        }),
      );
    } catch (error) {
      this.logger.error(
        `Failed to fetch Meta campaigns for account ${adAccountId}`,
        error,
      );
      throw error;
    }
  }
}
