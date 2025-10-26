import { Trans, useLingui } from '@lingui/react/macro';
import { useRecoilValue } from 'recoil';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { GoogleAdsAccountSelectorContainer } from '@/settings/integrations/marketing/components/GoogleAdsAccountSelectorContainer';
import { H2Title } from '@/ui/display/typography/components/H2Title';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { SettingsPath } from 'ninetwo-shared/types';
import { getSettingsPath } from 'ninetwo-shared/utils';
import { Section } from 'ninetwo-ui/layout';

import { type ConnectedAccount } from '@/accounts/types/ConnectedAccount';

export const SettingsIntegrationsMarketingGoogleAdsConfigure = () => {
  const { t } = useLingui();
  const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);

  const { records: connectedAccounts } = useFindManyRecords<ConnectedAccount>({
    objectNameSingular: CoreObjectNameSingular.ConnectedAccount,
    filter: {
      accountOwnerId: {
        eq: currentWorkspaceMember?.id,
      },
      provider: {
        eq: 'google',
      },
    },
  });

  // Verificar se a conta tem scopes do Google Ads
  const googleAdsAccount = connectedAccounts.find(
    (acc) => acc.scopes?.includes('https://www.googleapis.com/auth/adwords'),
  );

  if (!googleAdsAccount) {
    return (
      <SubMenuTopBarContainer
        title={t`Google Ads`}
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
          { children: <Trans>Google Ads</Trans> },
        ]}
      >
        <SettingsPageContainer>
          <Section>
            <H2Title
              title={t`Nenhuma conta Google Ads conectada`}
              description={t`Conecte sua conta Google Ads primeiro nas integrações de marketing.`}
            />
          </Section>
        </SettingsPageContainer>
      </SubMenuTopBarContainer>
    );
  }

  return (
    <SubMenuTopBarContainer
      title={t`Configurar Google Ads`}
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
        { children: <Trans>Google Ads</Trans> },
      ]}
    >
      <SettingsPageContainer>
        <GoogleAdsAccountSelectorContainer
          connectedAccountId={googleAdsAccount.id}
        />
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
