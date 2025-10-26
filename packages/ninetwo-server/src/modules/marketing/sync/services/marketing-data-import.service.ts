import { Injectable, Logger } from '@nestjs/common';

import { NinetwoORMGlobalManager } from 'src/engine/ninetwo-orm/ninetwo-orm-global.manager';
import { type ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { MarketingChannelSyncStatusService } from 'src/modules/marketing/common/services/marketing-channel-sync-status.service';
import { type MarketingChannelWorkspaceEntity } from 'src/modules/marketing/common/standard-objects/marketing-channel.workspace-entity';
import { GoogleAdsDataFetchService } from 'src/modules/marketing/sync/services/drivers/google-ads-data-fetch.service';
import { GoogleAnalyticsDataFetchService } from 'src/modules/marketing/sync/services/drivers/google-analytics-data-fetch.service';
import { MarketingDataStorageService } from 'src/modules/marketing/sync/services/marketing-data-storage.service';

@Injectable()
export class MarketingDataImportService {
  private readonly logger = new Logger(MarketingDataImportService.name);

  constructor(
    private readonly marketingChannelSyncStatusService: MarketingChannelSyncStatusService,
    private readonly twentyORMGlobalManager: NinetwoORMGlobalManager,
    private readonly marketingDataStorageService: MarketingDataStorageService,
    private readonly googleAdsDataFetchService: GoogleAdsDataFetchService,
    private readonly googleAnalyticsDataFetchService: GoogleAnalyticsDataFetchService,
  ) {}

  async processMarketingDataImport(
    marketingChannel: MarketingChannelWorkspaceEntity,
    connectedAccount: ConnectedAccountWorkspaceEntity,
    workspaceId: string,
  ): Promise<void> {
    this.logger.log(
      `Processing marketing data import for channel ${marketingChannel.id} of type ${marketingChannel.type}`,
    );

    await this.marketingChannelSyncStatusService.markAsDataImportOngoing(
      marketingChannel.id,
      workspaceId,
    );

    try {
      // Os dados já foram salvos pelo MarketingDataFetchService
      // Aqui apenas marcamos como completo
      this.logger.log(
        `Marketing data already stored for channel ${marketingChannel.id}. Marking as completed.`,
      );

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
