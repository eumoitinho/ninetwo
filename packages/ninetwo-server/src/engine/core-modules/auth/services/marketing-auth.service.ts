import { Injectable } from '@nestjs/common';

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

    // Check if account already exists
    const existingAccount = await connectedAccountRepository.findOne({
      where: {
        handle,
        provider,
        accountOwnerId: workspaceMemberId,
      },
    });

    if (existingAccount) {
      // Update tokens
      await connectedAccountRepository.update(
        { id: existingAccount.id },
        {
          accessToken,
          refreshToken: refreshToken || existingAccount.refreshToken,
          lastSyncHistoryId: '',
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
      syncConfig: {
        enabled: false, // User needs to configure which accounts to sync
      },
    });

    return newAccount.id;
  }
}

