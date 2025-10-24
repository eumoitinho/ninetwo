import { Module } from '@nestjs/common';

import { ObjectMetadataRepositoryModule } from 'src/engine/object-metadata-repository/object-metadata-repository.module';
import { MarketingChannelSyncStatusService } from 'src/modules/marketing/common/services/marketing-channel-sync-status.service';
import { MarketingChannelWorkspaceEntity } from 'src/modules/marketing/common/standard-objects/marketing-channel.workspace-entity';

@Module({
  imports: [
    ObjectMetadataRepositoryModule.forFeature([MarketingChannelWorkspaceEntity]),
  ],
  providers: [MarketingChannelSyncStatusService],
  exports: [MarketingChannelSyncStatusService],
})
export class MarketingCommonModule {}

