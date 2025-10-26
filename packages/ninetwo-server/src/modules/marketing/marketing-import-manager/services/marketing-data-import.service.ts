import { Injectable, Logger } from '@nestjs/common';

import { type ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { MarketingChannelSyncStatusService } from 'src/modules/marketing/common/services/marketing-channel-sync-status.service';
import { type MarketingChannelWorkspaceEntity } from 'src/modules/marketing/common/standard-objects/marketing-channel.workspace-entity';

@Injectable()
export class MarketingDataImportService {
  private readonly logger = new Logger(MarketingDataImportService.name);

  constructor(
    private readonly marketingChannelSyncStatusService: MarketingChannelSyncStatusService,
  ) {}

  async processMarketingDataImport(
    marketingChannel: MarketingChannelWorkspaceEntity,
    connectedAccount: ConnectedAccountWorkspaceEntity,
    workspaceId: string,
  ): Promise<void> {
    this.logger.log(
      `Processing marketing data import for channel ${marketingChannel.id}`,
    );

    await this.marketingChannelSyncStatusService.markAsDataImportOngoing(
      marketingChannel.id,
      workspaceId,
    );

    try {
      // TODO: Implement actual data import logic
      // This will store the fetched data into the database

      // Mark as completed after successful import
      await this.marketingChannelSyncStatusService.markAsCompleted(
        marketingChannel.id,
        workspaceId,
      );
    } catch (error) {
      this.logger.error(
        `Error importing marketing data for channel ${marketingChannel.id}`,
        error,
      );

      await this.marketingChannelSyncStatusService.markAsFailedUnknownAndFlushDataFetchPending(
        marketingChannel.id,
        workspaceId,
      );

      await this.marketingChannelSyncStatusService.incrementThrottleFailureCount(
        marketingChannel.id,
        workspaceId,
      );

      throw error;
    }
  }
}
