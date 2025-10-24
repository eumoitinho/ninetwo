import { Module } from '@nestjs/common';

import { ObjectMetadataRepositoryModule } from 'src/engine/object-metadata-repository/object-metadata-repository.module';
import { MarketingChannelSyncStatusService } from 'src/modules/marketing/common/services/marketing-channel-sync-status.service';
import { AdsCampaignWorkspaceEntity } from 'src/modules/marketing/common/standard-objects/ads-campaign.workspace-entity';
import { AnalyticsDataWorkspaceEntity } from 'src/modules/marketing/common/standard-objects/analytics-data.workspace-entity';
import { MarketingChannelWorkspaceEntity } from 'src/modules/marketing/common/standard-objects/marketing-channel.workspace-entity';
import { MarketingDashboardWorkspaceEntity } from 'src/modules/marketing/common/standard-objects/marketing-dashboard.workspace-entity';

@Module({
  imports: [
    ObjectMetadataRepositoryModule.forFeature([
      MarketingChannelWorkspaceEntity,
      AdsCampaignWorkspaceEntity,
      AnalyticsDataWorkspaceEntity,
      MarketingDashboardWorkspaceEntity,
    ]),
  ],
  providers: [MarketingChannelSyncStatusService],
  exports: [MarketingChannelSyncStatusService],
})
export class MarketingCommonModule {}

