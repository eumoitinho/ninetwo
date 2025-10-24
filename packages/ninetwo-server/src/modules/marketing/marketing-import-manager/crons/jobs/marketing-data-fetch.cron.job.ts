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
} from 'src/modules/marketing/marketing-import-manager/jobs/marketing-data-fetch.job';

export const MARKETING_DATA_FETCH_CRON_PATTERN = '0 */6 * * *'; // Every 6 hours

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

    for (const activeWorkspace of activeWorkspaces) {
      try {
        const schemaName = getWorkspaceSchemaName(activeWorkspace.id);

        const marketingChannels = await this.coreDataSource.query(
          `SELECT * FROM ${schemaName}."marketingChannel" WHERE "isSyncEnabled" = true AND "syncStage" = '${MarketingChannelSyncStage.DATA_FETCH_PENDING}'`,
        );

        for (const marketingChannel of marketingChannels) {
          await this.messageQueueService.add<MarketingDataFetchJobData>(
            MarketingDataFetchJob.name,
            {
              marketingChannelId: marketingChannel.id,
              workspaceId: activeWorkspace.id,
            },
          );
        }
      } catch (error) {
        this.exceptionHandlerService.captureExceptions([error], {
          workspace: {
            id: activeWorkspace.id,
          },
        });
      }
    }
  }
}

