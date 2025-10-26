import { Injectable, Logger } from '@nestjs/common';

import { BetaAnalyticsDataClient } from '@google-analytics/data';
import { OAuth2Client } from 'google-auth-library';

import { NinetwoConfigService } from 'src/engine/core-modules/ninetwo-config/ninetwo-config.service';

@Injectable()
export class GoogleAnalyticsOAuth2ClientManagerService {
  private readonly logger = new Logger(
    GoogleAnalyticsOAuth2ClientManagerService.name,
  );

  constructor(private readonly twentyConfigService: NinetwoConfigService) {}

  public async getOAuth2Client(
    refreshToken: string,
  ): Promise<BetaAnalyticsDataClient> {
    const clientId = this.twentyConfigService.get(
      'AUTH_GOOGLE_ANALYTICS_CLIENT_ID',
    );
    const clientSecret = this.twentyConfigService.get(
      'AUTH_GOOGLE_ANALYTICS_CLIENT_SECRET',
    );

    try {
      const oauth2Client = new OAuth2Client({
        clientId,
        clientSecret,
      });

      oauth2Client.setCredentials({
        refresh_token: refreshToken,
      });

      // BetaAnalyticsDataClient accepts OAuth2Client
      // Type coercion is needed due to strict type checking
      const client = new BetaAnalyticsDataClient();
      (client as unknown as { auth: OAuth2Client }).auth = oauth2Client;

      return client;
    } catch (error) {
      this.logger.error(`Error creating Google Analytics client`, error);
      throw error;
    }
  }
}
