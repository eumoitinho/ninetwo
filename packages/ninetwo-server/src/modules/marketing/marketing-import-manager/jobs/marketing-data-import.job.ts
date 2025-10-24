import { Scope } from '@nestjs/common';

import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { NinetwoORMManager } from 'src/engine/ninetwo-orm/ninetwo-orm.manager';
import { isThrottled } from 'src/modules/connected-account/utils/is-throttled';
import {
    MarketingChannelSyncStage,
    type MarketingChannelWorkspaceEntity,
} from 'src/modules/marketing/common/standard-objects/marketing-channel.workspace-entity';
import { MarketingDataImportService } from 'src/modules/marketing/marketing-import-manager/services/marketing-data-import.service';

export type MarketingDataImportJobData = {
  marketingChannelId: string;
  workspaceId: string;
};

@Processor({
  queueName: MessageQueue.marketingQueue,
  scope: Scope.REQUEST,
})
export class MarketingDataImportJob {
  constructor(
    private readonly marketingDataImportService: MarketingDataImportService,
    private readonly twentyORMManager: NinetwoORMManager,
  ) {}

  @Process(MarketingDataImportJob.name)
  async handle(data: MarketingDataImportJobData): Promise<void> {
    const { marketingChannelId, workspaceId } = data;

    const marketingChannelRepository =
      await this.twentyORMManager.getRepository<MarketingChannelWorkspaceEntity>(
        'marketingChannel',
      );

    const marketingChannel = await marketingChannelRepository.findOne({
      where: {
        id: marketingChannelId,
        isSyncEnabled: true,
      },
      relations: ['connectedAccount'],
    });

    if (!marketingChannel?.isSyncEnabled) {
      return;
    }

    if (
      isThrottled(
        marketingChannel.syncStageStartedAt,
        marketingChannel.throttleFailureCount,
      )
    ) {
      return;
    }

    if (
      marketingChannel.syncStage !==
        MarketingChannelSyncStage.DATA_IMPORT_PENDING &&
      marketingChannel.syncStage !==
        MarketingChannelSyncStage.DATA_IMPORT_SCHEDULED
    ) {
      return;
    }

    await this.marketingDataImportService.processMarketingDataImport(
      marketingChannel,
      marketingChannel.connectedAccount,
      workspaceId,
    );
  }
}

