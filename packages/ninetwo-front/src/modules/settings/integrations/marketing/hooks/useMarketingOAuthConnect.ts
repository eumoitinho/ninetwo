import { useCallback } from 'react';

import { useRedirect } from '@/domain-manager/hooks/useRedirect';
import { REACT_APP_SERVER_BASE_URL } from '~/config';
import { useGenerateTransientTokenMutation } from '~/generated-metadata/graphql';

export const useMarketingOAuthConnect = () => {
  const [generateTransientToken] = useGenerateTransientTokenMutation();
  const { redirect } = useRedirect();

  const connectPlatform = useCallback(
    async (endpoint: string, redirectPath?: string) => {
      const authServerUrl = REACT_APP_SERVER_BASE_URL;
      const transientToken = await generateTransientToken();
      const token =
        transientToken.data?.generateTransientToken.transientToken.token;

      let params = `transientToken=${token}`;

      if (redirectPath != null) {
        params += `&redirectLocation=${encodeURIComponent(redirectPath)}`;
      }

      redirect(`${authServerUrl}/auth/${endpoint}?${params}`);
    },
    [generateTransientToken, redirect],
  );

  const connectGoogleAds = useCallback(
    (redirectPath?: string) => {
      connectPlatform('google-apis', redirectPath);
    },
    [connectPlatform],
  );

  const connectGoogleAnalytics = useCallback(
    (redirectPath?: string) => {
      connectPlatform('google-apis', redirectPath);
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
  };
};
