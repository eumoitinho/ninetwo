import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';

import { Strategy, type VerifyCallback } from 'passport-google-oauth20';

import { GOOGLE_ANALYTICS_SCOPES } from 'ninetwo-marketing-core';
import { type GoogleAPIsRequest } from 'src/engine/core-modules/auth/types/google-api-request.type';
import { NinetwoConfigService } from 'src/engine/core-modules/ninetwo-config/ninetwo-config.service';

@Injectable()
export class GoogleAnalyticsOauthStrategy extends PassportStrategy(
  Strategy,
  'google-analytics',
) {
  constructor(twentyConfigService: NinetwoConfigService) {
    super({
      clientID: twentyConfigService.get('AUTH_GOOGLE_ANALYTICS_CLIENT_ID'),
      clientSecret: twentyConfigService.get(
        'AUTH_GOOGLE_ANALYTICS_CLIENT_SECRET',
      ),
      callbackURL: twentyConfigService.get(
        'AUTH_GOOGLE_ANALYTICS_CALLBACK_URL',
      ),
      scope: [...GOOGLE_ANALYTICS_SCOPES, 'email', 'profile'],
      accessType: 'offline',
      prompt: 'consent select_account',
      passReqToCallback: true,
    });
  }

  async validate(
    request: GoogleAPIsRequest,
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<void> {
    const { emails } = profile;
    const transientToken =
      typeof request.query.state === 'string'
        ? request.query.state
        : undefined;

    const user = {
      emails,
      accessToken,
      refreshToken,
      transientToken,
      redirectLocation: request.query.redirectLocation,
    };

    done(null, user);
  }
}
