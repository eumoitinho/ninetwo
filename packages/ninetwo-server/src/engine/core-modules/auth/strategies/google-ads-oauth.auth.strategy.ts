import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';

import { Strategy, type VerifyCallback } from 'passport-google-oauth20';

import { GOOGLE_ADS_SCOPES } from 'ninetwo-marketing-core';
import { NinetwoConfigService } from 'src/engine/core-modules/ninetwo-config/ninetwo-config.service';

export type GoogleAdsRequest = {
  user: {
    accessToken: string;
    refreshToken: string;
    transientToken?: string;
    emails: Array<{ value: string; verified: boolean }>;
  };
  query: {
    state?: string;
    redirect?: string;
  };
};

@Injectable()
export class GoogleAdsOauthStrategy extends PassportStrategy(
  Strategy,
  'google-ads',
) {
  constructor(twentyConfigService: NinetwoConfigService) {
    super({
      clientID: twentyConfigService.get('AUTH_GOOGLE_ADS_CLIENT_ID'),
      clientSecret: twentyConfigService.get('AUTH_GOOGLE_ADS_CLIENT_SECRET'),
      callbackURL: twentyConfigService.get('AUTH_GOOGLE_ADS_CALLBACK_URL'),
      scope: [...GOOGLE_ADS_SCOPES, 'email', 'profile'],
      accessType: 'offline',
      prompt: 'consent select_account',
      passReqToCallback: true,
    });
  }

  async validate(
    request: GoogleAdsRequest,
    accessToken: string,
    refreshToken: string,
    profile: {
      emails?: Array<{ value: string; verified: boolean }>;
    },
    done: VerifyCallback,
  ): Promise<void> {
    const { emails } = profile;
    const transientToken =
      typeof request.query.state === 'string' ? request.query.state : undefined;

    const user: GoogleAdsRequest['user'] = {
      accessToken,
      refreshToken,
      transientToken,
      emails: emails || [],
    };

    done(null, user);
  }
}

