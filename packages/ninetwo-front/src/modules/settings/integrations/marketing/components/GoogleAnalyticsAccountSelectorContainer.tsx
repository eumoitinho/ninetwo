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
  const { enqueueSnackBar } = useSnackBar();
  const [selectedAccountIds, setSelectedAccountIds] = useState<string[]>([]);

  const { data, loading, error } = useQuery(GET_MARKETING_ANALYTICS_ACCOUNTS, {
    variables: { connectedAccountId },
  });

  const [configureAccounts, { loading: configuring }] = useMutation(
    CONFIGURE_MARKETING_ANALYTICS_ACCOUNTS,
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

  if (error) {
    return (
      <Section>
        <H2Title title={t`Erro ao carregar propriedades`} />
        <p>{error.message}</p>
      </Section>
    );
  }

  const accounts: AdAccount[] =
    data?.getMarketingAnalyticsAccounts?.accounts || [];

  if (accounts.length === 0) {
    return (
      <Section>
        <H2Title title={t`Nenhuma propriedade encontrada`} />
        <p>
          <Trans>
            Não foram encontradas propriedades Google Analytics acessíveis.
            Verifique as permissões da sua conta.
          </Trans>
        </p>
      </Section>
    );
  }

  return (
    <Section>
      <H2Title
        title={t`Selecione as propriedades Google Analytics`}
        description={t`Escolha quais propriedades você deseja sincronizar com o NineTwo.`}
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


