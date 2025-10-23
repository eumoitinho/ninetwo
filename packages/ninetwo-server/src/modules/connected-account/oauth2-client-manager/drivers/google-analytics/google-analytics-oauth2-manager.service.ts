import { Injectable, Logger } from '@nestjs/common';

import { BetaAnalyticsDataClient } from '@google-analytics/data';
import { GoogleAuth } from 'google-auth-library';

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
      const auth = new GoogleAuth({
        credentials: {
          type: 'authorized_user',
          client_id: clientId,
          client_secret: clientSecret,
          refresh_token: refreshToken,
        },
        scopes: ['https://www.googleapis.com/auth/analytics.readonly'],
      });

      return new BetaAnalyticsDataClient({ auth });
    } catch (error) {
      this.logger.error(`Error creating Google Analytics client`, error);
      throw error;
    }
  }
}
