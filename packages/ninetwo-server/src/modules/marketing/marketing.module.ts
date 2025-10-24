import { Module } from '@nestjs/common';

import { NinetwoORMModule } from 'src/engine/ninetwo-orm/ninetwo-orm.module';
import { OAuth2ClientManagerModule } from 'src/modules/connected-account/oauth2-client-manager/oauth2-client-manager.module';
import { MarketingCommonModule } from 'src/modules/marketing/common/marketing-common.module';
import { MarketingImportManagerModule } from 'src/modules/marketing/marketing-import-manager/marketing-import-manager.module';
import { MarketingAPIsService } from 'src/modules/marketing/services/marketing-apis.service';

@Module({
  imports: [
    MarketingCommonModule,
    MarketingImportManagerModule,
    OAuth2ClientManagerModule,
    NinetwoORMModule,
  ],
  providers: [MarketingAPIsService],
  exports: [MarketingAPIsService, MarketingImportManagerModule],
})
export class MarketingModule {}

