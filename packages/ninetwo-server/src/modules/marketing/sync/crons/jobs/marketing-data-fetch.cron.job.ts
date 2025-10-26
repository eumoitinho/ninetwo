import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';

import { WorkspaceActivationStatus } from 'ninetwo-shared/workspace';
import { DataSource, Repository } from 'typeorm';

import { SentryCronMonitor } from 'src/engine/core-modules/cron/sentry-cron-monitor.decorator';
import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { MarketingChannelSyncStage } from 'src/modules/marketing/common/standard-objects/marketing-channel.workspace-entity';
import {
  MarketingDataFetchJob,
  type MarketingDataFetchJobData,
} from 'src/modules/marketing/sync/jobs/marketing-data-fetch.job';

export const MARKETING_DATA_FETCH_CRON_PATTERN = '*/2 * * * *'; // Every 2 minutes

@Processor({
  queueName: MessageQueue.cronQueue,
})
export class MarketingDataFetchCronJob {
  constructor(
    @InjectRepository(Workspace)
    private readonly workspaceRepository: Repository<Workspace>,
    @InjectMessageQueue(MessageQueue.marketingQueue)
    private readonly messageQueueService: MessageQueueService,
    @InjectDataSource()
    private readonly coreDataSource: DataSource,
    private readonly exceptionHandlerService: ExceptionHandlerService,
  ) {}

  @Process(MarketingDataFetchCronJob.name)
  @SentryCronMonitor(
    MarketingDataFetchCronJob.name,
    MARKETING_DATA_FETCH_CRON_PATTERN,
  )
  async handle(): Promise<void> {
    const activeWorkspaces = await this.workspaceRepository.find({
      where: {
        activationStatus: WorkspaceActivationStatus.ACTIVE,
      },
    });

    let totalChannelsProcessed = 0;

    for (const activeWorkspace of activeWorkspaces) {
      try {
        const schemaName = getWorkspaceSchemaName(activeWorkspace.id);

        // Check if marketingChannel table exists
        const tableExists = await this.coreDataSource.query(
          `
          SELECT EXISTS (
            SELECT FROM information_schema.tables
            WHERE table_schema = $1
            AND table_name = 'marketingChannel'
          )
        `,
          [schemaName],
        );

        if (!tableExists[0]?.exists) {
          continue;
        }

        const marketingChannels = await this.coreDataSource.query(
          `SELECT * FROM ${schemaName}."marketingChannel" WHERE "isSyncEnabled" = true AND "syncStage" = '${MarketingChannelSyncStage.DATA_FETCH_PENDING}'`,
        );

        if (marketingChannels.length > 0) {
          console.log(
            `[MarketingCron] Found ${marketingChannels.length} channels to process in workspace ${activeWorkspace.id}`,
          );
        }

        for (const marketingChannel of marketingChannels) {
          await this.messageQueueService.add<MarketingDataFetchJobData>(
            MarketingDataFetchJob.name,
            {
              marketingChannelId: marketingChannel.id,
              workspaceId: activeWorkspace.id,
            },
          );
          totalChannelsProcessed++;
        }
      } catch (error) {
        this.exceptionHandlerService.captureExceptions([error], {
          workspace: {
            id: activeWorkspace.id,
          },
        });
      }
    }

    if (totalChannelsProcessed > 0) {
      console.log(
        `[MarketingCron] Scheduled fetch for ${totalChannelsProcessed} marketing channels`,
      );
    }
  }
}
