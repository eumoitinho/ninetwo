import { Injectable, Logger } from '@nestjs/common';

import { GoogleAdsApi } from 'google-ads-api';

import { NinetwoConfigService } from 'src/engine/core-modules/ninetwo-config/ninetwo-config.service';

@Injectable()
export class GoogleAdsOAuth2ClientManagerService {
  private readonly logger = new Logger(
    GoogleAdsOAuth2ClientManagerService.name,
  );

  constructor(private readonly twentyConfigService: NinetwoConfigService) {}

  public async getOAuth2Client(_refreshToken: string): Promise<GoogleAdsApi> {
    const clientId = this.twentyConfigService.get('AUTH_GOOGLE_ADS_CLIENT_ID');
    const clientSecret = this.twentyConfigService.get(
      'AUTH_GOOGLE_ADS_CLIENT_SECRET',
    );
    const developerToken = this.twentyConfigService.get(
      'GOOGLE_ADS_DEVELOPER_TOKEN',
    );

    if (!developerToken || developerToken === 'your_developer_token_here') {
      this.logger.error('GOOGLE_ADS_DEVELOPER_TOKEN not configured properly');
      throw new Error(
        'Google Ads Developer Token not configured. Check server environment variables.',
      );
    }

    if (developerToken.startsWith('"') || developerToken.endsWith('"')) {
      this.logger.error(
        'Developer token contains quotes - remove quotes from .env file',
      );
      throw new Error(
        'Google Ads Developer Token has incorrect format (contains quotes).',
      );
    }

    try {
      const googleAdsClient = new GoogleAdsApi({
        client_id: clientId,
        client_secret: clientSecret,
        developer_token: developerToken,
      });

      return googleAdsClient;
    } catch (error) {
      this.logger.error(`Error creating Google Ads client`, error);
      throw error;
    }
  }
}
