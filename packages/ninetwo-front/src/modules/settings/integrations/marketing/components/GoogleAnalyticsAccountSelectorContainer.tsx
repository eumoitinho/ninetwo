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

import { CONFIGURE_MARKETING_ANALYTICS_ACCOUNTS } from '../graphql/configureMarketingAnalyticsAccounts';
import { GET_MARKETING_ANALYTICS_ACCOUNTS } from '../graphql/getMarketingAnalyticsAccounts';
import type { AdAccount } from '../types/MarketingIntegration';
import { GoogleAnalyticsAccountSelector } from './GoogleAnalyticsAccountSelector';

type GoogleAnalyticsAccountSelectorContainerProps = {
  connectedAccountId: string;
  onClose?: () => void;
};

export const GoogleAnalyticsAccountSelectorContainer = ({
  connectedAccountId,
  onClose,
}: GoogleAnalyticsAccountSelectorContainerProps) => {
  const { t } = useLingui();
  const navigate = useNavigate();
  const { enqueueSuccessSnackBar, enqueueErrorSnackBar } = useSnackBar();
  const [selectedAccountIds, setSelectedAccountIds] = useState<string[]>([]);

  const { data, loading, error } = useQuery(GET_MARKETING_ANALYTICS_ACCOUNTS, {
    variables: { connectedAccountId },
  });

  const [configureAccounts, { loading: configuring }] = useMutation(
    CONFIGURE_MARKETING_ANALYTICS_ACCOUNTS,
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
      onError: (error) => {
        enqueueErrorSnackBar({
          message: t`Error configuring accounts: ${error}`,
        });
      },
    },
  );

  const handleConfirm = async () => {
    await configureAccounts({
      variables: {
        connectedAccountId,
        propertyIds: selectedAccountIds,
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
        <H2Title title={t`Error loading properties`} />
        <p>
          <Trans>
            An error occurred while loading your Google Analytics properties.
          </Trans>
        </p>
        <p style={{ color: 'red' }}>{error.message}</p>
      </Section>
    );
  }

  const accounts: AdAccount[] =
    data?.getMarketingAnalyticsAccounts?.accounts || [];

  if (accounts.length === 0) {
    return (
      <Section>
        <H2Title title={t`No properties found`} />
        <p>
          <Trans>
            No accessible Google Analytics properties found. Check your account
            permissions.
          </Trans>
        </p>
      </Section>
    );
  }

  return (
    <Section>
      <H2Title
        title={t`Select Google Analytics properties`}
        description={t`Choose which properties you want to sync with NineTwo.`}
      />
      <GoogleAnalyticsAccountSelector
        accounts={accounts}
        selectedAccountIds={selectedAccountIds}
        onSelectionChange={setSelectedAccountIds}
        onConfirm={handleConfirm}
        onCancel={onClose}
        isLoading={configuring}
      />
    </Section>
  );
};
