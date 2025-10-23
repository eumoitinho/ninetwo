import { Injectable } from '@nestjs/common';

import { type WorkspaceEntityManager } from 'src/engine/ninetwo-orm/entity-manager/workspace-entity-manager';
import { NinetwoORMGlobalManager } from 'src/engine/ninetwo-orm/ninetwo-orm-global.manager';
import {
  CalendarChannelSyncStage,
  type CalendarChannelWorkspaceEntity,
} from 'src/modules/calendar/common/standard-objects/calendar-channel.workspace-entity';

export type ResetCalendarChannelsInput = {
  workspaceId: string;
  connectedAccountId: string;
  manager: WorkspaceEntityManager;
};

@Injectable()
export class ResetCalendarChannelService {
  constructor(
    private readonly twentyORMGlobalManager: NinetwoORMGlobalManager,
  ) {}

  async resetCalendarChannels(
    input: ResetCalendarChannelsInput,
  ): Promise<void> {
    const { workspaceId, connectedAccountId, manager } = input;

    const calendarChannelRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<CalendarChannelWorkspaceEntity>(
        workspaceId,
        'calendarChannel',
      );

    await calendarChannelRepository.update(
      {
        connectedAccountId,
      },
      {
        syncStage:
          CalendarChannelSyncStage.FULL_CALENDAR_EVENT_LIST_FETCH_PENDING,
        syncStatus: null,
        syncCursor: '',
        syncStageStartedAt: null,
      },
      manager,
    );

    return;
  }
}
