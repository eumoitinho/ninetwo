import { Module } from '@nestjs/common';

import { NinetwoORMModule } from 'src/engine/ninetwo-orm/ninetwo-orm.module';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';
import { ConnectedAccountModule } from 'src/modules/connected-account/connected-account.module';
import { OAuth2ClientManagerModule } from 'src/modules/connected-account/oauth2-client-manager/oauth2-client-manager.module';
import { RefreshTokensManagerModule } from 'src/modules/connected-account/refresh-tokens-manager/connected-account-refresh-tokens-manager.module';
import { MarketingAccountsManagerModule } from 'src/modules/marketing/marketing-accounts-manager/marketing-accounts-manager.module';
import { MarketingAdsResolver } from 'src/modules/marketing/marketing-realtime-manager/resolvers/marketing-ads.resolver';
import { CampaignManagerService } from 'src/modules/marketing/marketing-realtime-manager/services/campaign-manager.service';
import { GoogleAdsSyncService } from 'src/modules/marketing/marketing-realtime-manager/services/google-ads-sync.service';
import { GoogleAnalyticsSyncService } from 'src/modules/marketing/marketing-realtime-manager/services/google-analytics-sync.service';
import { MetaAdsSyncService } from 'src/modules/marketing/marketing-realtime-manager/services/meta-ads-sync.service';

@Module({
  imports: [
    NinetwoORMModule,
    WorkspaceDataSourceModule,
    ConnectedAccountModule,
    OAuth2ClientManagerModule,
    RefreshTokensManagerModule,
    MarketingAccountsManagerModule,
  ],
  providers: [
    GoogleAdsSyncService,
    GoogleAnalyticsSyncService,
    MetaAdsSyncService,
    CampaignManagerService,
    MarketingAdsResolver,
  ],
  exports: [
    GoogleAdsSyncService,
    GoogleAnalyticsSyncService,
    MetaAdsSyncService,
    CampaignManagerService,
  ],
})
export class MarketingRealtimeManagerModule {}
