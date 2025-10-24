import { Module } from '@nestjs/common';

import { NinetwoORMModule } from 'src/engine/ninetwo-orm/ninetwo-orm.module';
import { OAuth2ClientManagerModule } from 'src/modules/connected-account/oauth2-client-manager/oauth2-client-manager.module';
import { GoogleAdsAccountService } from 'src/modules/connected-account/services/google-ads-account.service';
import { GoogleAnalyticsPropertyService } from 'src/modules/connected-account/services/google-analytics-property.service';
import { MarketingAccountsResolver } from 'src/modules/connected-account/services/marketing-accounts.resolver';
import { MarketingCommonModule } from 'src/modules/marketing/common/marketing-common.module';
import { MarketingImportManagerModule } from 'src/modules/marketing/marketing-import-manager/marketing-import-manager.module';
import { MarketingChannelResolver } from 'src/modules/marketing/resolvers/marketing-channel.resolver';
import { MarketingAPIsService } from 'src/modules/marketing/services/marketing-apis.service';

@Module({
  imports: [
    MarketingCommonModule,
    MarketingImportManagerModule,
    OAuth2ClientManagerModule,
    NinetwoORMModule,
  ],
  providers: [
    MarketingAPIsService,
    MarketingChannelResolver,
    MarketingAccountsResolver,
    GoogleAdsAccountService,
    GoogleAnalyticsPropertyService,
  ],
  exports: [MarketingAPIsService, MarketingImportManagerModule],
})
export class MarketingModule {}

