import { Injectable } from '@nestjs/common';

import { GOOGLE_ADS_SCOPES, GOOGLE_ANALYTICS_SCOPES, META_ADS_SCOPES } from 'ninetwo-marketing-core';

import { NinetwoORMGlobalManager } from 'src/engine/ninetwo-orm/ninetwo-orm-global.manager';
import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';

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
        provider,
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

      return existingAccount.id;
    }

    // Create new connected account
    const newAccount = await connectedAccountRepository.save({
      handle,
      provider,
      accountOwnerId: workspaceMemberId,
      accessToken,
      refreshToken: refreshToken || null,
      lastSyncHistoryId: '',
      scopes,
      syncConfig: {
        enabled: false, // User needs to configure which accounts to sync
      },
    });

    return newAccount.id;
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


