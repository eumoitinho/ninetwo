import { Trans, useLingui } from '@lingui/react/macro';
import { useRecoilValue } from 'recoil';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { H2Title } from '@/ui/display/typography/components/H2Title';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { SettingsPath } from 'ninetwo-shared/types';
import { getSettingsPath } from 'ninetwo-shared/utils';
import { Section } from 'ninetwo-ui/layout';

import { type ConnectedAccount } from '@/accounts/types/ConnectedAccount';

export const SettingsIntegrationsMarketingGoogleAnalyticsConfigure = () => {
  const { t } = useLingui();
  const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);

  const { records: connectedAccounts } = useFindManyRecords<ConnectedAccount>({
    objectNameSingular: CoreObjectNameSingular.ConnectedAccount,
    filter: {
      accountOwnerId: {
        eq: currentWorkspaceMember?.id,
      },
      provider: {
        eq: 'google-analytics',
      },
    },
  });

  const googleAnalyticsAccount = connectedAccounts[0];

  if (!googleAnalyticsAccount) {
    return (
      <SubMenuTopBarContainer
        title={t`Google Analytics`}
        links={[
          {
            children: <Trans>Workspace</Trans>,
            href: getSettingsPath(SettingsPath.Workspace),
          },
          {
            children: <Trans>Integrations</Trans>,
            href: getSettingsPath(SettingsPath.Integrations),
          },
          {
            children: <Trans>Marketing</Trans>,
            href: getSettingsPath(SettingsPath.Integrations) + '/marketing',
          },
          { children: <Trans>Google Analytics</Trans> },
        ]}
      >
        <SettingsPageContainer>
          <Section>
            <H2Title
              title={t`Nenhuma conta Google Analytics conectada`}
              description={t`Conecte sua conta Google Analytics primeiro nas integrações de marketing.`}
            />
          </Section>
        </SettingsPageContainer>
      </SubMenuTopBarContainer>
    );
  }

  return (
    <SubMenuTopBarContainer
      title={t`Configurar Google Analytics`}
      links={[
        {
          children: <Trans>Workspace</Trans>,
          href: getSettingsPath(SettingsPath.Workspace),
        },
        {
          children: <Trans>Integrations</Trans>,
          href: getSettingsPath(SettingsPath.Integrations),
        },
        {
          children: <Trans>Marketing</Trans>,
          href: getSettingsPath(SettingsPath.Integrations) + '/marketing',
        },
        { children: <Trans>Google Analytics</Trans> },
      ]}
    >
      <SettingsPageContainer>
        <Section>
          <H2Title
            title={t`Google Analytics conectado com sucesso!`}
            description={t`Sua conta Google Analytics (${googleAnalyticsAccount.handle}) está conectada.`}
          />
          <p style={{ marginTop: '16px', color: '#666' }}>
            <Trans>
              A configuração detalhada das propriedades do Google Analytics 4
              (GA4) estará disponível em breve. Por enquanto, sua conta está
              conectada e pronta para uso.
            </Trans>
          </p>
        </Section>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};


