import { Injectable, Logger } from '@nestjs/common';

import { google, GoogleApis } from 'googleapis';

import { NinetwoConfigService } from 'src/engine/core-modules/ninetwo-config/ninetwo-config.service';

@Injectable()
export class GoogleOAuth2ClientManagerService {
  constructor(
    private readonly twentyConfigService: NinetwoConfigService,
    private readonly logger: Logger,
  ) {}

  public async getOAuth2Client(refreshToken: string): Promise<GoogleApis> {
    const gmailClientId = this.twentyConfigService.get('AUTH_GOOGLE_CLIENT_ID');
    const gmailClientSecret = this.twentyConfigService.get(
      'AUTH_GOOGLE_CLIENT_SECRET',
    );

    try {
      const oAuth2Client = new google.auth.OAuth2(
        gmailClientId,
        gmailClientSecret,
      );

      oAuth2Client.setCredentials({
        refresh_token: refreshToken,
      });

      google.options({ auth: oAuth2Client });

      return google;
    } catch (error) {
      this.logger.error(
        `Error in ${GoogleOAuth2ClientManagerService.name}`,
        error,
      );

      throw error;
    }
  }
}
