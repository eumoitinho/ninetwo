import { Injectable } from '@nestjs/common';

import { ConnectedAccountProvider } from 'ninetwo-shared/types';
import { v4 } from 'uuid';

import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { NinetwoORMGlobalManager } from 'src/engine/ninetwo-orm/ninetwo-orm-global.manager';
import { type ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import {
    MarketingChannelSyncStage,
    MarketingChannelSyncStatus,
    type MarketingChannelType,
    type MarketingChannelWorkspaceEntity,
} from 'src/modules/marketing/common/standard-objects/marketing-channel.workspace-entity';
import {
    MarketingDataFetchJob,
    type MarketingDataFetchJobData,
} from 'src/modules/marketing/marketing-import-manager/jobs/marketing-data-fetch.job';

export type CreateMarketingChannelInput = {
  handle: string;
  workspaceMemberId: string;
  workspaceId: string;
  provider: ConnectedAccountProvider;
  type: MarketingChannelType;
  accessToken: string;
  refreshToken?: string;
  accountConfig?: Record<string, any>;
};

@Injectable()
export class MarketingAPIsService {
  constructor(
    private readonly twentyORMGlobalManager: NinetwoORMGlobalManager,
    @InjectMessageQueue(MessageQueue.marketingQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {}

  async createMarketingChannel(
    input: CreateMarketingChannelInput,
  ): Promise<string> {
    const { handle, workspaceId, workspaceMemberId, provider, type, accessToken, refreshToken, accountConfig } = input;

    const connectedAccountRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<ConnectedAccountWorkspaceEntity>(
        workspaceId,
        'connectedAccount',
      );

    const marketingChannelRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<MarketingChannelWorkspaceEntity>(
        workspaceId,
        'marketingChannel',
      );

    // Find or create connected account
    let connectedAccount = await connectedAccountRepository.findOne({
      where: { handle, accountOwnerId: workspaceMemberId, provider },
    });

    const accountId = connectedAccount?.id ?? v4();

    if (!connectedAccount) {
      connectedAccount = await connectedAccountRepository.save({
        id: accountId,
        handle,
        provider,
        accessToken,
        refreshToken: refreshToken ?? '',
        accountOwnerId: workspaceMemberId,
      });
    } else {
      // Update tokens if account exists
      await connectedAccountRepository.update(accountId, {
        accessToken,
        refreshToken: refreshToken ?? connectedAccount.refreshToken,
      });
    }

    // Create or update marketing channel
    let marketingChannel = await marketingChannelRepository.findOne({
      where: { connectedAccountId: accountId, type },
    });

    if (!marketingChannel) {
      marketingChannel = await marketingChannelRepository.save({
        id: v4(),
        connectedAccountId: accountId,
        type,
        handle,
        isSyncEnabled: true,
        syncStatus: MarketingChannelSyncStatus.ONGOING,
        syncStage: accountConfig
          ? MarketingChannelSyncStage.DATA_FETCH_PENDING
          : MarketingChannelSyncStage.ACCOUNT_SELECTION_PENDING,
        syncCursor: '',
        syncStageStartedAt: null,
        throttleFailureCount: 0,
        accountConfig,
      });
    }

    // If account configuration is provided, schedule data fetch
    if (accountConfig && marketingChannel) {
      await this.messageQueueService.add<MarketingDataFetchJobData>(
        MarketingDataFetchJob.name,
        {
          workspaceId,
          marketingChannelId: marketingChannel.id,
        },
      );

      await marketingChannelRepository.update(marketingChannel.id, {
        syncStage: MarketingChannelSyncStage.DATA_FETCH_SCHEDULED,
        accountConfig,
      });
    }

    return marketingChannel.id;
  }

  async updateMarketingChannelAccountConfig(
    marketingChannelId: string,
    workspaceId: string,
    accountConfig: Record<string, any>,
  ): Promise<void> {
    const marketingChannelRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<MarketingChannelWorkspaceEntity>(
        workspaceId,
        'marketingChannel',
      );

    await marketingChannelRepository.update(marketingChannelId, {
      accountConfig,
      syncStage: MarketingChannelSyncStage.DATA_FETCH_PENDING,
    });

    // Schedule data fetch
    await this.messageQueueService.add<MarketingDataFetchJobData>(
      MarketingDataFetchJob.name,
      {
        workspaceId,
        marketingChannelId,
      },
    );
  }
}

