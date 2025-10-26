import { useMutation, useQuery } from '@apollo/client';
import { Trans, useLingui } from '@lingui/react/macro';
import { SettingsPath } from 'ninetwo-shared/types';
import { getSettingsPath } from 'ninetwo-shared/utils';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { H2Title } from 'ninetwo-ui/display';
import { Loader } from 'ninetwo-ui/feedback';
import { Section } from 'ninetwo-ui/layout';

import { CONFIGURE_MARKETING_AD_ACCOUNTS } from '../graphql/configureMarketingAdAccounts';
import { GET_MARKETING_AD_ACCOUNTS } from '../graphql/getMarketingAdAccounts';
import type { AdAccount } from '../types/MarketingIntegration';
import { GoogleAdsAccountSelector } from './GoogleAdsAccountSelector';

type GoogleAdsAccountSelectorContainerProps = {
  connectedAccountId: string;
  onClose?: () => void;
};

export const GoogleAdsAccountSelectorContainer = ({
  connectedAccountId,
  onClose,
}: GoogleAdsAccountSelectorContainerProps) => {
  const { t } = useLingui();
  const navigate = useNavigate();
  const { enqueueSuccessSnackBar, enqueueErrorSnackBar } = useSnackBar();
  const [selectedAccountIds, setSelectedAccountIds] = useState<string[]>([]);

  const { data, loading, error } = useQuery(GET_MARKETING_AD_ACCOUNTS, {
    variables: { connectedAccountId },
  });

  const [configureAccounts, { loading: configuring }] = useMutation(
    CONFIGURE_MARKETING_AD_ACCOUNTS,
    {
      onCompleted: () => {
        enqueueSuccessSnackBar({
          message: t`Accounts configured successfully!`,
        });
        if (typeof onClose === 'function') {
          onClose();
        } else {
          navigate(getSettingsPath(SettingsPath.IntegrationsMarketing));
        }
      },
      onError: (err) => {
        enqueueErrorSnackBar({
          message: t`Error configuring accounts: ${err.message}`,
        });
      },
    },
  );

  const handleConfirm = async () => {
    await configureAccounts({
      variables: {
        connectedAccountId,
        customerIds: selectedAccountIds,
        managerCustomerId: data?.getMarketingAdAccounts?.managerCustomerId,
      },
    });
  };

  if (loading) {
    return (
      <Section>
        <Loader />
      </Section>
    );
  }

  if (error != null) {
    return (
      <Section>
        <H2Title title={t`Error loading accounts`} />
      </Section>
    );
  }

  const accounts: AdAccount[] = data?.getMarketingAdAccounts?.accounts || [];
  const managerAccountId = data?.getMarketingAdAccounts?.managerCustomerId;

  if (accounts.length === 0) {
    return (
      <Section>
        <H2Title title={t`No accounts found`} />
        <p>
          <Trans>
            No Google Ads accounts found. Check your account permissions.
          </Trans>
        </p>
      </Section>
    );
  }

  return (
    <Section>
      <H2Title
        title={t`Select Google Ads accounts`}
        description={t`Choose which accounts you want to sync with NineTwo.`}
      />
      <GoogleAdsAccountSelector
        accounts={accounts}
        managerAccountId={managerAccountId}
        selectedAccountIds={selectedAccountIds}
        onSelectionChange={setSelectedAccountIds}
        onConfirm={handleConfirm}
        onCancel={onClose}
        isLoading={configuring}
      />
    </Section>
  );
};
