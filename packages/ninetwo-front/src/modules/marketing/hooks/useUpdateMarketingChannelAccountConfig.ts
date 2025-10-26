import { useApolloClient } from '@apollo/client';
import { useCallback } from 'react';

import { UPDATE_MARKETING_CHANNEL_ACCOUNT_CONFIG } from '@/marketing/graphql/mutations/updateMarketingChannelAccountConfig';

type UpdateMarketingChannelAccountConfigInput = {
  marketingChannelId: string;
  accountConfig: Record<string, any>;
};

export const useUpdateMarketingChannelAccountConfig = () => {
  const apolloClient = useApolloClient();

  const updateMarketingChannelAccountConfig = useCallback(
    async (input: UpdateMarketingChannelAccountConfigInput) => {
      const { marketingChannelId, accountConfig } = input;

      const result = await apolloClient.mutate({
        mutation: UPDATE_MARKETING_CHANNEL_ACCOUNT_CONFIG,
        variables: {
          marketingChannelId,
          accountConfig: JSON.stringify(accountConfig),
        },
      });

      return result.data?.updateMarketingChannelAccountConfig;
    },
    [apolloClient],
  );

  return { updateMarketingChannelAccountConfig };
};


