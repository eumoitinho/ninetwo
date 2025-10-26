import { Injectable, Logger } from '@nestjs/common';

import { NinetwoORMManager } from 'src/engine/ninetwo-orm/ninetwo-orm.manager';
import {
  MarketingChannelSyncStage,
  MarketingChannelSyncStatus,
  type MarketingChannelWorkspaceEntity,
} from 'src/modules/marketing/common/standard-objects/marketing-channel.workspace-entity';

@Injectable()
export class MarketingChannelSyncStatusService {
  private readonly logger = new Logger(MarketingChannelSyncStatusService.name);

  constructor(private readonly twentyORMManager: NinetwoORMManager) {}

  public async markAsFailedUnknownAndFlushDataFetchPending(
    marketingChannelId: string,
    workspaceId: string,
  ) {
    const marketingChannelRepository =
      await this.twentyORMManager.getRepository<MarketingChannelWorkspaceEntity>(
        'marketingChannel',
      );

    await marketingChannelRepository.update(marketingChannelId, {
      syncStatus: MarketingChannelSyncStatus.FAILED_UNKNOWN,
      syncStage: MarketingChannelSyncStage.FAILED,
    });
  }

  public async markAsFailedInsufficientPermissionsAndFlushDataFetchPending(
    marketingChannelId: string,
    workspaceId: string,
  ) {
    const marketingChannelRepository =
      await this.twentyORMManager.getRepository<MarketingChannelWorkspaceEntity>(
        'marketingChannel',
      );

    await marketingChannelRepository.update(marketingChannelId, {
      syncStatus: MarketingChannelSyncStatus.FAILED_INSUFFICIENT_PERMISSIONS,
      syncStage: MarketingChannelSyncStage.FAILED,
    });
  }

  public async resetAndScheduleFullDataFetch(
    marketingChannelId: string,
    workspaceId: string,
  ) {
    const marketingChannelRepository =
      await this.twentyORMManager.getRepository<MarketingChannelWorkspaceEntity>(
        'marketingChannel',
      );

    await marketingChannelRepository.update(marketingChannelId, {
      syncStatus: MarketingChannelSyncStatus.ONGOING,
      syncStage: MarketingChannelSyncStage.DATA_FETCH_PENDING,
      syncCursor: '',
      throttleFailureCount: 0,
      syncStageStartedAt: null,
    });
  }

  public async scheduleDataFetch(
    marketingChannelId: string,
    workspaceId: string,
  ) {
    const marketingChannelRepository =
      await this.twentyORMManager.getRepository<MarketingChannelWorkspaceEntity>(
        'marketingChannel',
      );

    await marketingChannelRepository.update(marketingChannelId, {
      syncStage: MarketingChannelSyncStage.DATA_FETCH_SCHEDULED,
    });
  }

  public async scheduleDataImport(
    marketingChannelId: string,
    workspaceId: string,
  ) {
    const marketingChannelRepository =
      await this.twentyORMManager.getRepository<MarketingChannelWorkspaceEntity>(
        'marketingChannel',
      );

    await marketingChannelRepository.update(marketingChannelId, {
      syncStage: MarketingChannelSyncStage.DATA_IMPORT_SCHEDULED,
    });
  }

  public async markAsDataFetchOngoing(
    marketingChannelId: string,
    workspaceId: string,
  ) {
    const marketingChannelRepository =
      await this.twentyORMManager.getRepository<MarketingChannelWorkspaceEntity>(
        'marketingChannel',
      );

    await marketingChannelRepository.update(marketingChannelId, {
      syncStatus: MarketingChannelSyncStatus.ONGOING,
      syncStage: MarketingChannelSyncStage.DATA_FETCH_ONGOING,
      syncStageStartedAt: new Date(),
    });
  }

  public async markAsDataImportOngoing(
    marketingChannelId: string,
    workspaceId: string,
  ) {
    const marketingChannelRepository =
      await this.twentyORMManager.getRepository<MarketingChannelWorkspaceEntity>(
        'marketingChannel',
      );

    await marketingChannelRepository.update(marketingChannelId, {
      syncStatus: MarketingChannelSyncStatus.ONGOING,
      syncStage: MarketingChannelSyncStage.DATA_IMPORT_ONGOING,
      syncStageStartedAt: new Date(),
    });
  }

  public async markAsCompleted(
    marketingChannelId: string,
    workspaceId: string,
  ) {
    const marketingChannelRepository =
      await this.twentyORMManager.getRepository<MarketingChannelWorkspaceEntity>(
        'marketingChannel',
      );

    await marketingChannelRepository.update(marketingChannelId, {
      syncStatus: MarketingChannelSyncStatus.ACTIVE,
      syncStage: MarketingChannelSyncStage.DATA_FETCH_PENDING,
      syncedAt: new Date(),
    });
  }

  public async markAsFailed(marketingChannelId: string, workspaceId: string) {
    const marketingChannelRepository =
      await this.twentyORMManager.getRepository<MarketingChannelWorkspaceEntity>(
        'marketingChannel',
      );

    await marketingChannelRepository.update(marketingChannelId, {
      syncStatus: MarketingChannelSyncStatus.FAILED_UNKNOWN,
      syncStage: MarketingChannelSyncStage.FAILED,
    });
  }

  public async incrementThrottleFailureCount(
    marketingChannelId: string,
    workspaceId: string,
  ) {
    const marketingChannelRepository =
      await this.twentyORMManager.getRepository<MarketingChannelWorkspaceEntity>(
        'marketingChannel',
      );

    const existingMarketingChannel =
      await marketingChannelRepository.findOneOrFail({
        where: { id: marketingChannelId },
      });

    await marketingChannelRepository.update(marketingChannelId, {
      throttleFailureCount: existingMarketingChannel.throttleFailureCount + 1,
    });
  }

  public async resetThrottleFailureCount(
    marketingChannelId: string,
    workspaceId: string,
  ) {
    const marketingChannelRepository =
      await this.twentyORMManager.getRepository<MarketingChannelWorkspaceEntity>(
        'marketingChannel',
      );

    await marketingChannelRepository.update(marketingChannelId, {
      throttleFailureCount: 0,
    });
  }
}
