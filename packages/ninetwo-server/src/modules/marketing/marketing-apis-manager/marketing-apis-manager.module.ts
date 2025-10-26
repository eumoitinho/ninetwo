// marketing/marketing-apis-manager/marketing-apis-manager.module.ts
import { Module } from '@nestjs/common';

import { NinetwoORMModule } from 'src/engine/ninetwo-orm/ninetwo-orm.module';
import { MarketingCommonModule } from 'src/modules/marketing/common/marketing-common.module';
import { MarketingChannelResolver } from 'src/modules/marketing/marketing-apis-manager/resolvers/marketing-channel.resolver';
import { MarketingAPIsService } from 'src/modules/marketing/marketing-apis-manager/services/marketing-apis.service';

@Module({
  imports: [MarketingCommonModule, NinetwoORMModule],
  providers: [MarketingAPIsService, MarketingChannelResolver],
  exports: [MarketingAPIsService],
})
export class MarketingApisManagerModule {}
