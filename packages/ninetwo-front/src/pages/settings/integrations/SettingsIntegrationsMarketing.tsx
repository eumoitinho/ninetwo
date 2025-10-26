import styled from '@emotion/styled';
import { Trans, useLingui } from '@lingui/react/macro';
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
import { ConnectedAccountProvider, SettingsPath } from 'ninetwo-shared/types';
import { getSettingsPath } from 'ninetwo-shared/utils';
import {
  H2Title,
  IconChartBar,
  IconChartPie,
  IconTargetArrow,
} from 'ninetwo-ui/display';
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
  const [configurationState, setConfigurationState] = useState<{
    connectedAccountId: string | null;
    platform: 'GOOGLE_ADS' | 'GOOGLE_ANALYTICS' | null;
  }>({ connectedAccountId: null, platform: null });

  const { records: connectedAccounts } = useFindManyRecords<ConnectedAccount>({
    objectNameSingular: CoreObjectNameSingular.ConnectedAccount,
    filter: {
      accountOwnerId: {
        eq: currentWorkspaceMember?.id,
      },
    },
  });

  useEffect(() => {
    const connected = searchParams.get('connected');
    const accountId = searchParams.get('accountId');

    if (connected != null && accountId != null) {
      if (connected === 'google-ads') {
        setConfigurationState({
          connectedAccountId: accountId,
          platform: 'GOOGLE_ADS',
        });
      } else if (connected === 'google-analytics') {
        setConfigurationState({
          connectedAccountId: accountId,
          platform: 'GOOGLE_ANALYTICS',
        });
      }
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);

  const integrations = useMemo(() => {
    // No Twenty-style, usamos provider GOOGLE e verificamos pelos scopes
    const googleAdsAccount = connectedAccounts.find(
      (acc) =>
        acc.provider === ConnectedAccountProvider.GOOGLE &&
        acc.scopes?.includes('https://www.googleapis.com/auth/adwords'),
    );
    const googleAnalyticsAccount = connectedAccounts.find(
      (acc) =>
        acc.provider === ConnectedAccountProvider.GOOGLE &&
        acc.scopes?.includes('https://www.googleapis.com/auth/analytics.readonly'),
    );
    const metaAdsAccount = connectedAccounts.find(
      (acc) => acc.provider === ConnectedAccountProvider.META_ADS,
    );

    return [
      {
        platform: 'GOOGLE_ADS' as const,
        name: 'Google Ads',
        description: t`Connect your Google Ads account to view campaigns, metrics and manage ads directly in NineTwo.`,
        Icon: IconTargetArrow,
        logoUrl: '/images/integrations/google-ads-logo.webp',
        isConnected: !!googleAdsAccount,
        connectedAccountId: googleAdsAccount?.id,
        configureUrl: '/settings/integrations/marketing/google-ads/configure',
        onConnect: () => connectGoogleAds('/settings/integrations/marketing'),
      },
      {
        platform: 'GOOGLE_ANALYTICS' as const,
        name: 'Google Analytics',
        description: t`Connect your Google Analytics (GA4) account to view traffic data, sessions and conversions.`,
        Icon: IconChartPie,
        logoUrl: '/images/integrations/google-analytics-logo.png',
        isConnected: !!googleAnalyticsAccount,
        connectedAccountId: googleAnalyticsAccount?.id,
        configureUrl:
          '/settings/integrations/marketing/google-analytics/configure',
        onConnect: () =>
          connectGoogleAnalytics('/settings/integrations/marketing'),
      },
      {
        platform: 'META_ADS' as const,
        name: 'Meta Ads',
        description: t`Connect your Meta Ads (Facebook/Instagram) account to manage campaigns and view metrics.`,
        Icon: IconChartBar,
        logoUrl: '/images/integrations/meta-logo.png',
        isConnected: !!metaAdsAccount,
        connectedAccountId: metaAdsAccount?.id,
        configureUrl: '/settings/integrations/marketing/meta-ads/configure',
        onConnect: () => connectMetaAds('/settings/integrations/marketing'),
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
            description={t`Connect your marketing platforms to track campaigns, metrics and analytics data`}
          />

          {configurationState.platform === null ? (
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
                  onReconnect={
                    integration.isConnected ? integration.onConnect : undefined
                  }
                  onManage={() => {
                    const accountId = integration.connectedAccountId;
                    if (
                      accountId != null &&
                      (integration.platform === 'GOOGLE_ADS' ||
                        integration.platform === 'GOOGLE_ANALYTICS')
                    ) {
                      setConfigurationState({
                        connectedAccountId: accountId,
                        platform: integration.platform,
                      });
                    }
                  }}
                />
              ))}
            </StyledCardsContainer>
          ) : configurationState.platform === 'GOOGLE_ADS' ? (
            <GoogleAdsAccountSelectorContainer
              connectedAccountId={configurationState.connectedAccountId!}
              onClose={() =>
                setConfigurationState({
                  platform: null,
                  connectedAccountId: null,
                })
              }
            />
          ) : configurationState.platform === 'GOOGLE_ANALYTICS' ? (
            <GoogleAnalyticsAccountSelectorContainer
              connectedAccountId={configurationState.connectedAccountId!}
              onClose={() =>
                setConfigurationState({
                  platform: null,
                  connectedAccountId: null,
                })
              }
            />
          ) : null}
        </Section>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
