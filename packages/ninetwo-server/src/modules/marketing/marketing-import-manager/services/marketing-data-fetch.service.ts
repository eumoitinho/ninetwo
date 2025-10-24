import { Injectable, Logger } from '@nestjs/common';

import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { type ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { MarketingChannelSyncStatusService } from 'src/modules/marketing/common/services/marketing-channel-sync-status.service';
import {
    MarketingChannelType,
    type MarketingChannelWorkspaceEntity,
} from 'src/modules/marketing/common/standard-objects/marketing-channel.workspace-entity';
import {
    MarketingDataImportJob,
    type MarketingDataImportJobData,
} from 'src/modules/marketing/marketing-import-manager/jobs/marketing-data-import.job';
import { GoogleAdsDataFetchService } from 'src/modules/marketing/marketing-import-manager/services/drivers/google-ads-data-fetch.service';
import { GoogleAnalyticsDataFetchService } from 'src/modules/marketing/marketing-import-manager/services/drivers/google-analytics-data-fetch.service';

@Injectable()
export class MarketingDataFetchService {
  private readonly logger = new Logger(MarketingDataFetchService.name);

  constructor(
    private readonly marketingChannelSyncStatusService: MarketingChannelSyncStatusService,
    private readonly googleAdsDataFetchService: GoogleAdsDataFetchService,
    private readonly googleAnalyticsDataFetchService: GoogleAnalyticsDataFetchService,
    @InjectMessageQueue(MessageQueue.marketingQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {}

  async processMarketingDataFetch(
    marketingChannel: MarketingChannelWorkspaceEntity,
    connectedAccount: ConnectedAccountWorkspaceEntity,
    workspaceId: string,
  ): Promise<void> {
    this.logger.log(
      `Processing marketing data fetch for channel ${marketingChannel.id} of type ${marketingChannel.type}`,
    );

    await this.marketingChannelSyncStatusService.markAsDataFetchOngoing(
      marketingChannel.id,
    );

    try {
      switch (marketingChannel.type) {
        case MarketingChannelType.GOOGLE_ADS:
          await this.googleAdsDataFetchService.fetchCampaigns(
            marketingChannel,
            connectedAccount,
            workspaceId,
          );
          break;

        case MarketingChannelType.GOOGLE_ANALYTICS:
          await this.googleAnalyticsDataFetchService.fetchProperties(
            marketingChannel,
            connectedAccount,
            workspaceId,
          );
          break;

        case MarketingChannelType.META_ADS:
          // TODO: Implement Meta Ads fetching
          this.logger.warn('Meta Ads fetching not yet implemented');
          break;

        default:
          this.logger.warn(
            `Unknown marketing channel type: ${marketingChannel.type}`,
          );

          return;
      }

      // Schedule data import after successful fetch
      await this.marketingChannelSyncStatusService.scheduleDataImport(
        marketingChannel.id,
      );

      await this.messageQueueService.add<MarketingDataImportJobData>(
        MarketingDataImportJob.name,
        {
          workspaceId,
          marketingChannelId: marketingChannel.id,
        },
      );

      await this.marketingChannelSyncStatusService.resetThrottleFailureCount(
        marketingChannel.id,
      );
    } catch (error) {
      this.logger.error(
        `Error fetching marketing data for channel ${marketingChannel.id}`,
        error,
      );

      await this.marketingChannelSyncStatusService.markAsFailedUnknownAndFlushDataFetchPending(
        marketingChannel.id,
      );

      await this.marketingChannelSyncStatusService.incrementThrottleFailureCount(
        marketingChannel.id,
      );

      throw error;
    }
  }
}
