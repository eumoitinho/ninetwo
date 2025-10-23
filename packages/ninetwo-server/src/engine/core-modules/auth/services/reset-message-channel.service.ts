import { Injectable } from '@nestjs/common';

import { type WorkspaceEntityManager } from 'src/engine/ninetwo-orm/entity-manager/workspace-entity-manager';
import { NinetwoORMGlobalManager } from 'src/engine/ninetwo-orm/ninetwo-orm-global.manager';
import {
  MessageChannelSyncStage,
  MessageChannelSyncStatus,
  type MessageChannelWorkspaceEntity,
} from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';

export type ResetMessageChannelsInput = {
  workspaceId: string;
  connectedAccountId: string;
  manager: WorkspaceEntityManager;
};

@Injectable()
export class ResetMessageChannelService {
  constructor(
    private readonly twentyORMGlobalManager: NinetwoORMGlobalManager,
  ) {}

  async resetMessageChannels(input: ResetMessageChannelsInput): Promise<void> {
    const { workspaceId, connectedAccountId, manager } = input;

    const messageChannelRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<MessageChannelWorkspaceEntity>(
        workspaceId,
        'messageChannel',
      );

    await messageChannelRepository.update(
      {
        connectedAccountId,
      },
      {
        syncStage: MessageChannelSyncStage.FULL_MESSAGE_LIST_FETCH_PENDING,
        syncStatus: MessageChannelSyncStatus.ONGOING,
        syncCursor: '',
        syncStageStartedAt: null,
      },
      manager,
    );

    return;
  }
}
