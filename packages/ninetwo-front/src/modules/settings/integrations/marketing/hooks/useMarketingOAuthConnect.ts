import { useCallback } from 'react';

import { REACT_APP_SERVER_BASE_URL } from '~/config';
import { useGenerateTransientTokenMutation } from '~/generated-metadata/graphql';

export type MarketingPlatform = 'google-ads' | 'google-analytics' | 'meta-ads';

export const useMarketingOAuthConnect = () => {
  const [generateTransientToken] = useGenerateTransientTokenMutation();

  const connectPlatform = useCallback(
    async (platform: MarketingPlatform, redirectPath?: string) => {
      const baseUrl = REACT_APP_SERVER_BASE_URL;

      // Generate transient token for OAuth flow
      const transientTokenResponse = await generateTransientToken();
      const transientToken =
        transientTokenResponse.data?.generateTransientToken.transientToken
          .token;

      if (!transientToken) {
        throw new Error('Failed to generate transient token');
      }

      let authUrl = `${baseUrl}/auth/${platform}?transientToken=${transientToken}`;

      if (redirectPath) {
        authUrl += `&redirect=${encodeURIComponent(redirectPath)}`;
      }

      // Redirect to OAuth flow
      window.location.href = authUrl;
    },
    [generateTransientToken],
  );

  const connectGoogleAds = useCallback(
    (redirectPath?: string) => {
      connectPlatform('google-ads', redirectPath);
    },
    [connectPlatform],
  );

  const connectGoogleAnalytics = useCallback(
    (redirectPath?: string) => {
      connectPlatform('google-analytics', redirectPath);
    },
    [connectPlatform],
  );

  const connectMetaAds = useCallback(
    (redirectPath?: string) => {
      connectPlatform('meta-ads', redirectPath);
    },
    [connectPlatform],
  );

  return {
    connectGoogleAds,
    connectGoogleAnalytics,
    connectMetaAds,
    connectPlatform,
  };
};
