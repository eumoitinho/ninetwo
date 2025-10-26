import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { useRecoilValue } from 'recoil';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { type AdsCampaign } from '@/marketing/types/AdsCampaign';
import { type AnalyticsData } from '@/marketing/types/AnalyticsData';
import { type MarketingChannel } from '@/marketing/types/MarketingChannel';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { PageBody } from '@/ui/layout/page/components/PageBody';
import { PageContainer } from '@/ui/layout/page/components/PageContainer';
import { PageHeader } from '@/ui/layout/page/components/PageHeader';
import { PageTitle } from '@/ui/layout/page/components/PageTitle';
import { H2Title, IconChartBar, IconTargetArrow } from 'ninetwo-ui/display';
import { Card, Section } from 'ninetwo-ui/layout';

const StyledDashboardContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(6)};
`;

const StyledCardsGrid = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing(4)};
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
`;

const StyledMetricCard = styled(Card)`
  padding: ${({ theme }) => theme.spacing(4)};
`;

const StyledMetricValue = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.xxl};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  margin-top: ${({ theme }) => theme.spacing(2)};
`;

const StyledMetricLabel = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.sm};
`;

const StyledSectionHeader = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  margin-bottom: ${({ theme }) => theme.spacing(4)};
`;

export const MarketingHome = () => {
  const { t } = useLingui();
  const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);

  const { records: marketingChannels } = useFindManyRecords<MarketingChannel>({
    objectNameSingular: CoreObjectNameSingular.MarketingChannel,
    filter: {
      isSyncEnabled: {
        eq: true,
      },
    },
  });

  const { records: adsCampaigns } = useFindManyRecords<AdsCampaign>({
    objectNameSingular: CoreObjectNameSingular.AdsCampaign,
    filter: {},
  });

  const { records: analyticsData } = useFindManyRecords<AnalyticsData>({
    objectNameSingular: CoreObjectNameSingular.AnalyticsData,
    filter: {},
    orderBy: [{ date: 'DescNullsLast' }],
    limit: 30,
  });

  // Calculate aggregate metrics for Ads
  const totalImpressions = adsCampaigns.reduce(
    (sum, c) => sum + (c.impressions || 0),
    0,
  );
  const totalClicks = adsCampaigns.reduce((sum, c) => sum + (c.clicks || 0), 0);
  const totalCost = adsCampaigns.reduce(
    (sum, c) => sum + (c.costMicros || 0),
    0,
  );
  const totalConversions = adsCampaigns.reduce(
    (sum, c) => sum + (c.conversions || 0),
    0,
  );
  const totalConversionValue = adsCampaigns.reduce(
    (sum, c) => sum + (c.conversionValue || 0),
    0,
  );

  const averageCPC = totalClicks > 0 ? totalCost / totalClicks / 1000000 : 0;
  const averageCPA =
    totalConversions > 0 ? totalCost / totalConversions / 1000000 : 0;
  const roas = totalCost > 0 ? totalConversionValue / totalCost : 0;
  const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;

  // Calculate aggregate metrics for Analytics
  const totalSessions = analyticsData.reduce(
    (sum, d) => sum + (d.sessions || 0),
    0,
  );
  const totalUsers = analyticsData.reduce(
    (sum, d) => sum + (d.totalUsers || 0),
    0,
  );
  const totalPageViews = analyticsData.reduce(
    (sum, d) => sum + (d.screenPageViews || 0),
    0,
  );
  const totalAnalyticsConversions = analyticsData.reduce(
    (sum, d) => sum + (d.conversions || 0),
    0,
  );
  const totalRevenue = analyticsData.reduce(
    (sum, d) => sum + (d.totalRevenue || 0),
    0,
  );

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);

  const formatNumber = (value: number) =>
    new Intl.NumberFormat('pt-BR').format(Math.round(value));

  const formatPercentage = (value: number) => `${value.toFixed(2)}%`;

  return (
    <PageContainer>
      <PageHeader>
        <PageTitle title={t`Marketing`} />
      </PageHeader>
      <PageBody>
        <StyledDashboardContainer>
          {/* Google Ads Campaigns Section */}
          <Section>
            <StyledSectionHeader>
              <IconTargetArrow />
              <H2Title
                title={t`Google Ads Campaigns`}
                description={t`Performance metrics from your advertising campaigns`}
              />
            </StyledSectionHeader>
            <StyledCardsGrid>
              <StyledMetricCard>
                <StyledMetricLabel>{t`Total Impressions`}</StyledMetricLabel>
                <StyledMetricValue>
                  {formatNumber(totalImpressions)}
                </StyledMetricValue>
              </StyledMetricCard>
              <StyledMetricCard>
                <StyledMetricLabel>{t`Total Clicks`}</StyledMetricLabel>
                <StyledMetricValue>{formatNumber(totalClicks)}</StyledMetricValue>
              </StyledMetricCard>
              <StyledMetricCard>
                <StyledMetricLabel>{t`CTR`}</StyledMetricLabel>
                <StyledMetricValue>{formatPercentage(ctr)}</StyledMetricValue>
              </StyledMetricCard>
              <StyledMetricCard>
                <StyledMetricLabel>{t`Total Spend`}</StyledMetricLabel>
                <StyledMetricValue>
                  {formatCurrency(totalCost / 1000000)}
                </StyledMetricValue>
              </StyledMetricCard>
              <StyledMetricCard>
                <StyledMetricLabel>{t`Average CPC`}</StyledMetricLabel>
                <StyledMetricValue>
                  {formatCurrency(averageCPC)}
                </StyledMetricValue>
              </StyledMetricCard>
              <StyledMetricCard>
                <StyledMetricLabel>{t`Conversions`}</StyledMetricLabel>
                <StyledMetricValue>
                  {formatNumber(totalConversions)}
                </StyledMetricValue>
              </StyledMetricCard>
              <StyledMetricCard>
                <StyledMetricLabel>{t`Average CPA`}</StyledMetricLabel>
                <StyledMetricValue>
                  {formatCurrency(averageCPA)}
                </StyledMetricValue>
              </StyledMetricCard>
              <StyledMetricCard>
                <StyledMetricLabel>{t`ROAS`}</StyledMetricLabel>
                <StyledMetricValue>
                  {roas.toFixed(2)}x
                </StyledMetricValue>
              </StyledMetricCard>
            </StyledCardsGrid>
          </Section>

          {/* Google Analytics Section */}
          <Section>
            <StyledSectionHeader>
              <IconChartBar />
              <H2Title
                title={t`Google Analytics`}
                description={t`Website traffic and engagement metrics`}
              />
            </StyledSectionHeader>
            <StyledCardsGrid>
              <StyledMetricCard>
                <StyledMetricLabel>{t`Total Sessions`}</StyledMetricLabel>
                <StyledMetricValue>
                  {formatNumber(totalSessions)}
                </StyledMetricValue>
              </StyledMetricCard>
              <StyledMetricCard>
                <StyledMetricLabel>{t`Total Users`}</StyledMetricLabel>
                <StyledMetricValue>{formatNumber(totalUsers)}</StyledMetricValue>
              </StyledMetricCard>
              <StyledMetricCard>
                <StyledMetricLabel>{t`Page Views`}</StyledMetricLabel>
                <StyledMetricValue>
                  {formatNumber(totalPageViews)}
                </StyledMetricValue>
              </StyledMetricCard>
              <StyledMetricCard>
                <StyledMetricLabel>{t`Conversions`}</StyledMetricLabel>
                <StyledMetricValue>
                  {formatNumber(totalAnalyticsConversions)}
                </StyledMetricValue>
              </StyledMetricCard>
              <StyledMetricCard>
                <StyledMetricLabel>{t`Total Revenue`}</StyledMetricLabel>
                <StyledMetricValue>
                  {formatCurrency(totalRevenue)}
                </StyledMetricValue>
              </StyledMetricCard>
            </StyledCardsGrid>
          </Section>

          {/* Campaigns Details Section */}
          <Section>
            <H2Title
              title={t`Active Campaigns`}
              description={t`${adsCampaigns.length} campaigns from ${marketingChannels.length} connected accounts`}
            />
          </Section>
        </StyledDashboardContainer>
      </PageBody>
    </PageContainer>
  );
};


