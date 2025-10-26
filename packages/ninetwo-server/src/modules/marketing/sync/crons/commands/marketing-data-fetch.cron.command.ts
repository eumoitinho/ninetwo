import { Command, CommandRunner } from 'nest-commander';

import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import {
  MARKETING_DATA_FETCH_CRON_PATTERN,
  MarketingDataFetchCronJob,
} from 'src/modules/marketing/sync/crons/jobs/marketing-data-fetch.cron.job';

@Command({
  name: 'cron:marketing:data-fetch:register',
  description: 'Registers a cron job to fetch marketing data periodically',
})
export class MarketingDataFetchCronCommand extends CommandRunner {
  constructor(
    @InjectMessageQueue(MessageQueue.cronQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {
    super();
  }

  async run(): Promise<void> {
    await this.messageQueueService.addCron<undefined>({
      jobName: MarketingDataFetchCronJob.name,
      data: undefined,
      options: {
        repeat: {
          pattern: MARKETING_DATA_FETCH_CRON_PATTERN,
        },
      },
    });
  }
}
