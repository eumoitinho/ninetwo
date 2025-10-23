import { useMutation, useQuery } from '@apollo/client';
import { Trans, useLingui } from '@lingui/react/macro';
import { SettingsPath } from 'ninetwo-shared/types';
import { getSettingsPath } from 'ninetwo-shared/utils';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
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
  const { enqueueSnackBar } = useSnackBar();
  const [selectedAccountIds, setSelectedAccountIds] = useState<string[]>([]);

  const { data, loading, error } = useQuery(GET_MARKETING_AD_ACCOUNTS, {
    variables: { connectedAccountId },
  });

  const [configureAccounts, { loading: configuring }] = useMutation(
    CONFIGURE_MARKETING_AD_ACCOUNTS,
    {
      onCompleted: () => {
        enqueueSnackBar(t`Contas configuradas com sucesso!`, {
          variant: SnackBarVariant.Success,
        });
        if (onClose) {
          onClose();
        } else {
          navigate(getSettingsPath(SettingsPath.IntegrationsMarketing));
        }
      },
      onError: (err) => {
        enqueueSnackBar(t`Erro ao configurar contas: ${err.message}`, {
          variant: SnackBarVariant.Error,
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

  if (error) {
    return (
      <Section>
        <H2Title title={t`Erro ao carregar contas`} />
        <p>{error.message}</p>
      </Section>
    );
  }

  const accounts: AdAccount[] = data?.getMarketingAdAccounts?.accounts || [];
  const managerAccountId = data?.getMarketingAdAccounts?.managerCustomerId;

  if (accounts.length === 0) {
    return (
      <Section>
        <H2Title title={t`Nenhuma conta encontrada`} />
        <p>
          <Trans>
            Não foram encontradas contas Google Ads acessíveis. Verifique as
            permissões da sua conta.
          </Trans>
        </p>
      </Section>
    );
  }

  return (
    <Section>
      <H2Title
        title={t`Selecione as contas Google Ads`}
        description={t`Escolha quais contas você deseja sincronizar com o NineTwo.`}
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
