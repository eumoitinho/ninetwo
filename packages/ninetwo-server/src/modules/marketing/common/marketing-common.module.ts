import { Module } from '@nestjs/common';

import { NinetwoORMModule } from 'src/engine/ninetwo-orm/ninetwo-orm.module';
import { MarketingChannelSyncStatusService } from 'src/modules/marketing/common/services/marketing-channel-sync-status.service';

@Module({
  imports: [NinetwoORMModule],
  providers: [MarketingChannelSyncStatusService],
  exports: [MarketingChannelSyncStatusService],
})
export class MarketingCommonModule {}
