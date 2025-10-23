import { Logger, Module } from '@nestjs/common';

import { GoogleAdsOAuth2ClientManagerService } from 'src/modules/connected-account/oauth2-client-manager/drivers/google-ads/google-ads-oauth2-manager.service';
import { GoogleAnalyticsOAuth2ClientManagerService } from 'src/modules/connected-account/oauth2-client-manager/drivers/google-analytics/google-analytics-oauth2-manager.service';
import { GoogleOAuth2ClientManagerService } from 'src/modules/connected-account/oauth2-client-manager/drivers/google/google-oauth2-client-manager.service';
import { MetaAdsOAuth2ClientManagerService } from 'src/modules/connected-account/oauth2-client-manager/drivers/meta-ads/meta-ads-oauth2-manager.service';
import { MicrosoftOAuth2ClientManagerService } from 'src/modules/connected-account/oauth2-client-manager/drivers/microsoft/microsoft-oauth2-client-manager.service';
import { OAuth2ClientManagerService } from 'src/modules/connected-account/oauth2-client-manager/services/oauth2-client-manager.service';

@Module({
  imports: [],
  providers: [
    OAuth2ClientManagerService,
    GoogleOAuth2ClientManagerService,
    GoogleAdsOAuth2ClientManagerService,
    GoogleAnalyticsOAuth2ClientManagerService,
    MetaAdsOAuth2ClientManagerService,
    MicrosoftOAuth2ClientManagerService,
    Logger,
  ],
  exports: [
    OAuth2ClientManagerService,
    GoogleAdsOAuth2ClientManagerService,
    GoogleAnalyticsOAuth2ClientManagerService,
    MetaAdsOAuth2ClientManagerService,
    MicrosoftOAuth2ClientManagerService,
  ],
})
export class OAuth2ClientManagerModule {}
