import { Injectable, Logger } from '@nestjs/common';

import { type WorkspaceRepository } from 'src/engine/ninetwo-orm/repository/workspace.repository';
import { InjectObjectMetadataRepository } from 'src/engine/object-metadata-repository/object-metadata-repository.decorator';
import {
    MarketingChannelSyncStage,
    MarketingChannelSyncStatus,
    type MarketingChannelWorkspaceEntity,
} from 'src/modules/marketing/common/standard-objects/marketing-channel.workspace-entity';

@Injectable()
export class MarketingChannelSyncStatusService {
  private readonly logger = new Logger(MarketingChannelSyncStatusService.name);

  constructor(
    @InjectObjectMetadataRepository(MarketingChannelWorkspaceEntity)
    private readonly marketingChannelRepository: WorkspaceRepository<MarketingChannelWorkspaceEntity>,
  ) {}

  public async markAsFailedUnknownAndFlushDataFetchPending(
    marketingChannelId: string,
  ) {
    await this.marketingChannelRepository.update(marketingChannelId, {
      syncStatus: MarketingChannelSyncStatus.FAILED_UNKNOWN,
      syncStage: MarketingChannelSyncStage.FAILED,
    });
  }

  public async markAsFailedInsufficientPermissionsAndFlushDataFetchPending(
    marketingChannelId: string,
  ) {
    await this.marketingChannelRepository.update(marketingChannelId, {
      syncStatus: MarketingChannelSyncStatus.FAILED_INSUFFICIENT_PERMISSIONS,
      syncStage: MarketingChannelSyncStage.FAILED,
    });
  }

  public async resetAndScheduleFullDataFetch(marketingChannelId: string) {
    await this.marketingChannelRepository.update(marketingChannelId, {
      syncStatus: MarketingChannelSyncStatus.ONGOING,
      syncStage: MarketingChannelSyncStage.DATA_FETCH_PENDING,
      syncCursor: '',
      throttleFailureCount: 0,
      syncStageStartedAt: null,
    });
  }

  public async scheduleDataFetch(marketingChannelId: string) {
    await this.marketingChannelRepository.update(marketingChannelId, {
      syncStage: MarketingChannelSyncStage.DATA_FETCH_SCHEDULED,
    });
  }

  public async scheduleDataImport(marketingChannelId: string) {
    await this.marketingChannelRepository.update(marketingChannelId, {
      syncStage: MarketingChannelSyncStage.DATA_IMPORT_SCHEDULED,
    });
  }

  public async markAsDataFetchOngoing(marketingChannelId: string) {
    await this.marketingChannelRepository.update(marketingChannelId, {
      syncStatus: MarketingChannelSyncStatus.ONGOING,
      syncStage: MarketingChannelSyncStage.DATA_FETCH_ONGOING,
      syncStageStartedAt: new Date(),
    });
  }

  public async markAsDataImportOngoing(marketingChannelId: string) {
    await this.marketingChannelRepository.update(marketingChannelId, {
      syncStatus: MarketingChannelSyncStatus.ONGOING,
      syncStage: MarketingChannelSyncStage.DATA_IMPORT_ONGOING,
      syncStageStartedAt: new Date(),
    });
  }

  public async markAsCompleted(marketingChannelId: string) {
    await this.marketingChannelRepository.update(marketingChannelId, {
      syncStatus: MarketingChannelSyncStatus.ACTIVE,
      syncStage: MarketingChannelSyncStage.DATA_FETCH_PENDING,
      syncedAt: new Date(),
    });
  }

  public async incrementThrottleFailureCount(marketingChannelId: string) {
    const existingMarketingChannel =
      await this.marketingChannelRepository.findOneOrFail({
        where: { id: marketingChannelId },
      });

    await this.marketingChannelRepository.update(marketingChannelId, {
      throttleFailureCount: existingMarketingChannel.throttleFailureCount + 1,
    });
  }

  public async resetThrottleFailureCount(marketingChannelId: string) {
    await this.marketingChannelRepository.update(marketingChannelId, {
      throttleFailureCount: 0,
    });
  }
}

