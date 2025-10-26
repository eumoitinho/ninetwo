import { Module } from '@nestjs/common';

import { NinetwoORMModule } from 'src/engine/ninetwo-orm/ninetwo-orm.module';
import { OAuth2ClientManagerModule } from 'src/modules/connected-account/oauth2-client-manager/oauth2-client-manager.module';
import { RefreshTokensManagerModule } from 'src/modules/connected-account/refresh-tokens-manager/connected-account-refresh-tokens-manager.module';
import { MarketingAccountsResolver } from 'src/modules/marketing/marketing-accounts-manager/resolvers/marketing-accounts.resolver';
import { GoogleAdsAccountService } from 'src/modules/marketing/marketing-accounts-manager/services/google-ads-account.service';
import { GoogleAnalyticsPropertyService } from 'src/modules/marketing/marketing-accounts-manager/services/google-analytics-property.service';

@Module({
  imports: [
    OAuth2ClientManagerModule,
    RefreshTokensManagerModule,
    NinetwoORMModule,
  ],
  providers: [
    GoogleAdsAccountService,
    GoogleAnalyticsPropertyService,
    MarketingAccountsResolver,
  ],
  exports: [GoogleAdsAccountService, GoogleAnalyticsPropertyService],
})
export class MarketingAccountsManagerModule {}
