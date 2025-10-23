import { Injectable } from '@nestjs/common';

import { BetaAnalyticsDataClient } from '@google-analytics/data';
import { type Client } from '@microsoft/microsoft-graph-client';
import { FacebookAdsApi } from 'facebook-nodejs-business-sdk';
import { GoogleAdsApi } from 'google-ads-api';
import { GoogleApis } from 'googleapis';

import { GoogleAdsOAuth2ClientManagerService } from 'src/modules/connected-account/oauth2-client-manager/drivers/google-ads/google-ads-oauth2-manager.service';
import { GoogleAnalyticsOAuth2ClientManagerService } from 'src/modules/connected-account/oauth2-client-manager/drivers/google-analytics/google-analytics-oauth2-manager.service';
import { GoogleOAuth2ClientManagerService } from 'src/modules/connected-account/oauth2-client-manager/drivers/google/google-oauth2-client-manager.service';
import { MetaAdsOAuth2ClientManagerService } from 'src/modules/connected-account/oauth2-client-manager/drivers/meta-ads/meta-ads-oauth2-manager.service';
import { MicrosoftOAuth2ClientManagerService } from 'src/modules/connected-account/oauth2-client-manager/drivers/microsoft/microsoft-oauth2-client-manager.service';
import { type ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';

@Injectable()
export class OAuth2ClientManagerService {
  constructor(
    private readonly googleOAuth2ClientManagerService: GoogleOAuth2ClientManagerService,
    private readonly microsoftOAuth2ClientManagerService: MicrosoftOAuth2ClientManagerService,
    private readonly googleAdsOAuth2ClientManagerService: GoogleAdsOAuth2ClientManagerService,
    private readonly googleAnalyticsOAuth2ClientManagerService: GoogleAnalyticsOAuth2ClientManagerService,
    private readonly metaAdsOAuth2ClientManagerService: MetaAdsOAuth2ClientManagerService,
  ) {}

  public async getGoogleOAuth2Client(
    connectedAccount: Pick<
      ConnectedAccountWorkspaceEntity,
      'provider' | 'refreshToken'
    >,
  ): Promise<GoogleApis> {
    return this.googleOAuth2ClientManagerService.getOAuth2Client(
      connectedAccount.refreshToken,
    );
  }

  public async getMicrosoftOAuth2Client(
    connectedAccount: Pick<
      ConnectedAccountWorkspaceEntity,
      'provider' | 'accessToken'
    >,
  ): Promise<Client> {
    return this.microsoftOAuth2ClientManagerService.getOAuth2Client(
      connectedAccount.accessToken,
    );
  }

  public async getGoogleAdsOAuth2Client(
    connectedAccount: Pick<
      ConnectedAccountWorkspaceEntity,
      'provider' | 'refreshToken'
    >,
  ): Promise<GoogleAdsApi> {
    return this.googleAdsOAuth2ClientManagerService.getOAuth2Client(
      connectedAccount.refreshToken,
    );
  }

  public async getGoogleAnalyticsOAuth2Client(
    connectedAccount: Pick<
      ConnectedAccountWorkspaceEntity,
      'provider' | 'refreshToken'
    >,
  ): Promise<BetaAnalyticsDataClient> {
    return this.googleAnalyticsOAuth2ClientManagerService.getOAuth2Client(
      connectedAccount.refreshToken,
    );
  }

  public async getMetaAdsOAuth2Client(
    connectedAccount: Pick<
      ConnectedAccountWorkspaceEntity,
      'provider' | 'accessToken'
    >,
  ): Promise<FacebookAdsApi> {
    return this.metaAdsOAuth2ClientManagerService.getOAuth2Client(
      connectedAccount.accessToken,
    );
  }
}
