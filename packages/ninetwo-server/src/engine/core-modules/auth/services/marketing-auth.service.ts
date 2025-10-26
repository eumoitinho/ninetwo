import { Injectable } from '@nestjs/common';

import { v4 as uuidv4 } from 'uuid';

import { GOOGLE_ADS_SCOPES, GOOGLE_ANALYTICS_SCOPES, META_ADS_SCOPES } from 'ninetwo-marketing-core';
import { ConnectedAccountProvider } from 'ninetwo-shared/types';

import { NinetwoORMGlobalManager } from 'src/engine/ninetwo-orm/ninetwo-orm-global.manager';
import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import {
  MarketingChannelSyncStage,
  MarketingChannelSyncStatus,
  MarketingChannelType,
  type MarketingChannelWorkspaceEntity,
} from 'src/modules/marketing/common/standard-objects/marketing-channel.workspace-entity';

@Injectable()
export class MarketingAuthService {
  constructor(
    private readonly twentyORMGlobalManager: NinetwoORMGlobalManager,
  ) {}

  async saveMarketingConnectedAccount({
    handle,
    workspaceMemberId,
    workspaceId,
    provider,
    accessToken,
    refreshToken,
  }: {
    handle: string;
    workspaceMemberId: string;
    workspaceId: string;
    provider: 'google-ads' | 'google-analytics' | 'meta-ads';
    accessToken: string;
    refreshToken?: string;
  }): Promise<string> {
    const connectedAccountRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<ConnectedAccountWorkspaceEntity>(
        workspaceId,
        'connectedAccount',
      );

    // Get scopes based on provider
    const scopes = this.getScopesForProvider(provider);

    // Check if account already exists
    const existingAccount = await connectedAccountRepository.findOne({
      where: {
        handle,
        provider: provider as ConnectedAccountProvider,
        accountOwnerId: workspaceMemberId,
      },
    });

    if (existingAccount) {
      // Update tokens and scopes
      await connectedAccountRepository.update(
        { id: existingAccount.id },
        {
          accessToken,
          refreshToken: refreshToken || existingAccount.refreshToken,
          lastSyncHistoryId: '',
          scopes,
          authFailedAt: null,
        },
      );

      // Ensure MarketingChannel exists for reconnection
      await this.ensureMarketingChannelExists({
        workspaceId,
        connectedAccountId: existingAccount.id,
        handle,
        type: this.getMarketingChannelType(provider),
      });

      return existingAccount.id;
    }

    // Create new connected account
    const savedAccounts = await connectedAccountRepository.save([
      {
        handle,
        provider: provider as ConnectedAccountProvider,
        accountOwnerId: workspaceMemberId,
        accessToken,
        refreshToken: refreshToken || '',
        lastSyncHistoryId: '',
        scopes,
        syncConfig: {
          enabled: false, // User needs to configure which accounts to sync
        },
      },
    ]);

    const newAccount = savedAccounts[0];

    // Create MarketingChannel
    await this.createMarketingChannel({
      workspaceId,
      connectedAccountId: newAccount.id,
      handle,
      type: this.getMarketingChannelType(provider),
    });

    return newAccount.id;
  }

  private async ensureMarketingChannelExists({
    workspaceId,
    connectedAccountId,
    handle,
    type,
  }: {
    workspaceId: string;
    connectedAccountId: string;
    handle: string;
    type: MarketingChannelType;
  }): Promise<string> {
    const marketingChannelRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<MarketingChannelWorkspaceEntity>(
        workspaceId,
        'marketingChannel',
      );

    const existingChannel = await marketingChannelRepository.findOne({
      where: {
        connectedAccountId,
      },
    });

    if (existingChannel) {
      return existingChannel.id;
    }

    return this.createMarketingChannel({
      workspaceId,
      connectedAccountId,
      handle,
      type,
    });
  }

  private async createMarketingChannel({
    workspaceId,
    connectedAccountId,
    handle,
    type,
  }: {
    workspaceId: string;
    connectedAccountId: string;
    handle: string;
    type: MarketingChannelType;
  }): Promise<string> {
    const marketingChannelRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<MarketingChannelWorkspaceEntity>(
        workspaceId,
        'marketingChannel',
      );

    const newMarketingChannel = await marketingChannelRepository.save({
      id: uuidv4(),
      connectedAccountId,
      handle,
      type,
      syncStatus: MarketingChannelSyncStatus.NOT_SYNCED,
      syncStage: MarketingChannelSyncStage.ACCOUNT_SELECTION_PENDING,
      isSyncEnabled: true,
      throttleFailureCount: 0,
      syncCursor: '',
    });

    return newMarketingChannel.id;
  }

  private getMarketingChannelType(
    provider: 'google-ads' | 'google-analytics' | 'meta-ads',
  ): MarketingChannelType {
    switch (provider) {
      case 'google-ads':
        return MarketingChannelType.GOOGLE_ADS;
      case 'google-analytics':
        return MarketingChannelType.GOOGLE_ANALYTICS;
      case 'meta-ads':
        return MarketingChannelType.META_ADS;
    }
  }

  private getScopesForProvider(
    provider: 'google-ads' | 'google-analytics' | 'meta-ads',
  ): string[] {
    switch (provider) {
      case 'google-ads':
        return [...GOOGLE_ADS_SCOPES, 'email', 'profile'];
      case 'google-analytics':
        return [...GOOGLE_ANALYTICS_SCOPES, 'email', 'profile'];
      case 'meta-ads':
        return [...META_ADS_SCOPES];
      default:
        return [];
    }
  }
}


