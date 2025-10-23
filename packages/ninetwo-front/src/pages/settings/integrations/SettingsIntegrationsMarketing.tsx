import styled from '@emotion/styled';
import { Trans, useLingui } from '@lingui/react/macro';
import {
    IconChartBar,
    IconChartPie,
    IconTargetArrow,
} from '@tabler/icons-react';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useRecoilValue } from 'recoil';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { GoogleAdsAccountSelectorContainer } from '@/settings/integrations/marketing/components/GoogleAdsAccountSelectorContainer';
import { GoogleAnalyticsAccountSelectorContainer } from '@/settings/integrations/marketing/components/GoogleAnalyticsAccountSelectorContainer';
import { MarketingIntegrationCard } from '@/settings/integrations/marketing/components/MarketingIntegrationCard';
import { useMarketingOAuthConnect } from '@/settings/integrations/marketing/hooks/useMarketingOAuthConnect';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { SettingsPath } from 'ninetwo-shared/types';
import { getSettingsPath } from 'ninetwo-shared/utils';
import { H2Title } from 'ninetwo-ui/display';
import { Section } from 'ninetwo-ui/layout';

import { type ConnectedAccount } from '@/accounts/types/ConnectedAccount';

const StyledCardsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: ${({ theme }) => theme.spacing(4)};
  margin-top: ${({ theme }) => theme.spacing(6)};
`;

export const SettingsIntegrationsMarketing = () => {
  const { t } = useLingui();
  const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);
  const { connectGoogleAds, connectGoogleAnalytics, connectMetaAds } =
    useMarketingOAuthConnect();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showAccountSelector, setShowAccountSelector] = useState<{
    platform: 'google-ads' | 'google-analytics' | null;
    accountId: string | null;
  }>({ platform: null, accountId: null });

  const { records: connectedAccounts } = useFindManyRecords<ConnectedAccount>({
    objectNameSingular: CoreObjectNameSingular.ConnectedAccount,
    filter: {
      accountOwnerId: {
        eq: currentWorkspaceMember?.id,
      },
    },
  });

  // Detecta quando voltou do OAuth e mostra o seletor de contas
  useEffect(() => {
    const connected = searchParams.get('connected');
    const accountId = searchParams.get('accountId');

    if (connected && accountId) {
      if (connected === 'google-ads' || connected === 'google-analytics') {
        setShowAccountSelector({
          platform: connected,
          accountId,
        });
      }
      // Limpa os parâmetros da URL
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);

  const integrations = useMemo(() => {
    const googleAdsAccount = connectedAccounts.find(
      (acc) => acc.provider === 'google-ads',
    );
    const googleAnalyticsAccount = connectedAccounts.find(
      (acc) => acc.provider === 'google-analytics',
    );
    const metaAdsAccount = connectedAccounts.find(
      (acc) => acc.provider === 'meta-ads',
    );

    return [
      {
        platform: 'GOOGLE_ADS' as const,
        name: 'Google Ads',
        description: t`Conecte sua conta Google Ads para visualizar campanhas, métricas e gerenciar anúncios diretamente no NineTwo.`,
        Icon: IconTargetArrow,
        logoUrl: '/images/integrations/google-ads-logo.webp',
        isConnected: !!googleAdsAccount,
        connectedAccountId: googleAdsAccount?.id,
        configureUrl: '/settings/integrations/marketing/google-ads/configure',
        onConnect: () =>
          connectGoogleAds(
            '/settings/integrations/marketing',
          ),
      },
      {
        platform: 'GOOGLE_ANALYTICS' as const,
        name: 'Google Analytics',
        description: t`Conecte sua conta Google Analytics (GA4) para visualizar dados de tráfego, sessões e conversões.`,
        Icon: IconChartPie,
        logoUrl: '/images/integrations/google-analytics-logo.png',
        isConnected: !!googleAnalyticsAccount,
        connectedAccountId: googleAnalyticsAccount?.id,
        configureUrl: '/settings/integrations/marketing/google-analytics/configure',
        onConnect: () =>
          connectGoogleAnalytics(
            '/settings/integrations/marketing',
          ),
      },
      {
        platform: 'META_ADS' as const,
        name: 'Meta Ads',
        description: t`Conecte sua conta de anúncios Meta (Facebook/Instagram) para gerenciar campanhas e visualizar métricas.`,
        Icon: IconChartBar,
        logoUrl: '/images/integrations/meta-logo.png',
        isConnected: !!metaAdsAccount,
        connectedAccountId: metaAdsAccount?.id,
        configureUrl: '/settings/integrations/marketing/meta-ads/configure',
        onConnect: () =>
          connectMetaAds('/settings/integrations/marketing'),
      },
    ];
  }, [
    connectedAccounts,
    t,
    connectGoogleAds,
    connectGoogleAnalytics,
    connectMetaAds,
  ]);

  return (
    <SubMenuTopBarContainer
      title={t`Marketing`}
      links={[
        {
          children: <Trans>Workspace</Trans>,
          href: getSettingsPath(SettingsPath.Workspace),
        },
        {
          children: <Trans>Integrations</Trans>,
          href: getSettingsPath(SettingsPath.Integrations),
        },
        { children: <Trans>Marketing</Trans> },
      ]}
    >
      <SettingsPageContainer>
        <Section>
          <H2Title
            title={t`Marketing & Analytics`}
            description={t`Conecte suas plataformas de marketing para rastrear campanhas, métricas e dados de análise`}
          />

          {showAccountSelector.platform === null ? (
            <StyledCardsContainer>
              {integrations.map((integration) => (
                <MarketingIntegrationCard
                  key={integration.platform}
                  platform={integration.platform}
                  name={integration.name}
                  description={integration.description}
                  Icon={integration.Icon}
                  logoUrl={integration.logoUrl}
                  isConnected={integration.isConnected}
                  onConnect={integration.onConnect}
                  onReconnect={integration.isConnected ? integration.onConnect : undefined}
                  onManage={() => {
                    // Mostrar seletor inline
                    const accountId = integration.connectedAccountId;
                    if (accountId && integration.platform !== 'META_ADS') {
                      setShowAccountSelector({
                        platform:
                          integration.platform === 'GOOGLE_ADS'
                            ? 'google-ads'
                            : 'google-analytics',
                        accountId,
                      });
                    }
                  }}
                />
              ))}
            </StyledCardsContainer>
          ) : showAccountSelector.platform === 'google-ads' ? (
            <GoogleAdsAccountSelectorContainer
              connectedAccountId={showAccountSelector.accountId!}
              onClose={() =>
                setShowAccountSelector({ platform: null, accountId: null })
              }
            />
          ) : showAccountSelector.platform === 'google-analytics' ? (
            <GoogleAnalyticsAccountSelectorContainer
              connectedAccountId={showAccountSelector.accountId!}
              onClose={() =>
                setShowAccountSelector({ platform: null, accountId: null })
              }
            />
          ) : null}
        </Section>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
