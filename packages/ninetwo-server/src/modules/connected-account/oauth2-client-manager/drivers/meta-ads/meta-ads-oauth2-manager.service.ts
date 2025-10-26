import { Injectable, Logger } from '@nestjs/common';

import { FacebookAdsApi } from 'facebook-nodejs-business-sdk';

import { NinetwoConfigService } from 'src/engine/core-modules/ninetwo-config/ninetwo-config.service';

@Injectable()
export class MetaAdsOAuth2ClientManagerService {
  private readonly logger = new Logger(MetaAdsOAuth2ClientManagerService.name);

  constructor(private readonly twentyConfigService: NinetwoConfigService) {}

  public async getOAuth2Client(accessToken: string): Promise<FacebookAdsApi> {
    try {
      // Initialize with access token
      const api = FacebookAdsApi.init(accessToken);

      api.setDebug(false);

      return api;
    } catch (error) {
      this.logger.error(`Error creating Meta Ads client`, error);
      throw error;
    }
  }
}
