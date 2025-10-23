import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';

import { Strategy, type VerifyCallback } from 'passport-google-oauth20';

import { GOOGLE_ANALYTICS_SCOPES } from 'ninetwo-marketing-core';
import { NinetwoConfigService } from 'src/engine/core-modules/ninetwo-config/ninetwo-config.service';

export type GoogleAnalyticsRequest = {
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
    request: GoogleAnalyticsRequest,
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

    const user: GoogleAnalyticsRequest['user'] = {
      accessToken,
      refreshToken,
      transientToken,
      emails: emails || [],
    };

    done(null, user);
  }
}

