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
import { MarketingDataFetchService } from 'src/modules/marketing/marketing-import-manager/services/marketing-data-fetch.service';

export type MarketingDataFetchJobData = {
  marketingChannelId: string;
  workspaceId: string;
};

@Processor({
  queueName: MessageQueue.marketingQueue,
  scope: Scope.REQUEST,
})
export class MarketingDataFetchJob {
  constructor(
    private readonly marketingDataFetchService: MarketingDataFetchService,
    private readonly twentyORMManager: NinetwoORMManager,
  ) {}

  @Process(MarketingDataFetchJob.name)
  async handle(data: MarketingDataFetchJobData): Promise<void> {
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
        MarketingChannelSyncStage.DATA_FETCH_PENDING &&
      marketingChannel.syncStage !==
        MarketingChannelSyncStage.DATA_FETCH_SCHEDULED
    ) {
      return;
    }

    await this.marketingDataFetchService.processMarketingDataFetch(
      marketingChannel,
      marketingChannel.connectedAccount,
      workspaceId,
    );
  }
}

