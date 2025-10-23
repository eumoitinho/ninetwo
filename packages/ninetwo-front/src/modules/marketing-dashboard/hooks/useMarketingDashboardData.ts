import { useMemo } from 'react';
import { useQuery } from '@apollo/client';
import { useRecoilValue } from 'recoil';

import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { GET_MARKETING_CAMPAIGNS } from '@/settings/integrations/marketing/graphql/getMarketingCampaigns';

type ConnectedAccount = {
  id: string;
  provider: string;
  syncConfig: any;
};

export const useMarketingDashboardData = () => {
  const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);

  const { records: connectedAccounts, loading: loadingAccounts } =
    useFindManyRecords<ConnectedAccount>({
      objectNameSingular: CoreObjectNameSingular.ConnectedAccount,
      filter: {
        accountOwnerId: {
          eq: currentWorkspaceMember?.id,
        },
        provider: {
          in: ['google-ads', 'meta-ads'],
        },
      },
    });

  const firstAccount = connectedAccounts[0];
  const customerIds = firstAccount?.syncConfig?.marketing?.customerIds || [];
  const firstCustomerId = customerIds[0];

  const { data, loading: loadingCampaigns } = useQuery(
    GET_MARKETING_CAMPAIGNS,
    {
      variables: {
        connectedAccountId: firstAccount?.id,
        customerId: firstCustomerId || '',
        managerCustomerId:
          firstAccount?.syncConfig?.marketing?.managerCustomerId,
      },
      skip: !firstAccount || !firstCustomerId,
      fetchPolicy: 'network-only',
    },
  );

  const campaigns = useMemo(() => data?.getMarketingCampaigns || [], [data]);

  return {
    campaigns,
    connectedAccounts,
    loading: loadingAccounts || loadingCampaigns,
    hasAccounts: connectedAccounts.length > 0,
  };
};
