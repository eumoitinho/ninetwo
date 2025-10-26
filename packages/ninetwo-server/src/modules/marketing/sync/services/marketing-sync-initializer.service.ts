import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';

import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import {
  MARKETING_DATA_FETCH_CRON_PATTERN,
  MarketingDataFetchCronJob,
} from 'src/modules/marketing/sync/crons/jobs/marketing-data-fetch.cron.job';

/**
 * Service to initialize marketing sync on application startup
 * This ensures cron jobs are registered and stuck channels are reset
 */
@Injectable()
export class MarketingSyncInitializerService implements OnApplicationBootstrap {
  private readonly logger = new Logger(MarketingSyncInitializerService.name);

  constructor(
    @InjectMessageQueue(MessageQueue.cronQueue)
    private readonly cronQueueService: MessageQueueService,
  ) {}

  async onApplicationBootstrap() {
    try {
      await this.registerMarketingCronJobs();
    } catch (error) {
      this.logger.error('Failed to initialize marketing sync', error);
    }
  }

  private async registerMarketingCronJobs(): Promise<void> {
    this.logger.log('🔄 Registering marketing cron jobs...');

    try {
      // Simply register the cron job - it will skip if already exists
      await this.cronQueueService.addCron<undefined>({
        jobName: MarketingDataFetchCronJob.name,
        data: undefined,
        options: {
          repeat: {
            pattern: MARKETING_DATA_FETCH_CRON_PATTERN,
          },
        },
      });

      this.logger.log('✅ Marketing cron job registered successfully');
    } catch (error) {
      // Check if it's a duplicate job error
      if (error.message?.includes('duplicate') || error.message?.includes('exists')) {
        this.logger.log('✅ Marketing cron job already registered');
      } else {
        this.logger.error('Failed to register marketing cron jobs:', error);
      }
      // Don't throw - we don't want to prevent the app from starting
    }
  }
}