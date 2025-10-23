import styled from '@emotion/styled';
import { IconAlertCircle } from '@tabler/icons-react';
import { Trans, useLingui } from '@lingui/react/macro';
import { useNavigate } from 'react-router-dom';

import { PageBody } from '@/ui/layout/page/components/PageBody';
import { PageContainer } from '@/ui/layout/page/components/PageContainer';
import { PageHeader } from '@/ui/layout/page/components/PageHeader';
import { useMarketingDashboardData } from '@/marketing-dashboard/hooks/useMarketingDashboardData';
import { Loader } from '@/ui/feedback/loader/components/Loader';
import { Button } from '@/ui/input/button/components/Button';
import { SettingsPath } from 'ninetwo-shared/types';
import { getSettingsPath } from 'ninetwo-shared/utils';

const StyledDashboardContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(6)};
  padding: ${({ theme }) => theme.spacing(6)};
`;

const StyledEmptyState = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
  justify-content: center;
  padding: ${({ theme }) => theme.spacing(20)};
  text-align: center;
`;

const StyledEmptyStateText = styled.p`
  font-size: ${({ theme }) => theme.font.size.md};
  color: ${({ theme }) => theme.font.color.secondary};
  max-width: 500px;
`;

const StyledCampaignsTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: ${({ theme }) => theme.background.secondary};
  border-radius: ${({ theme }) => theme.border.radius.md};
  overflow: hidden;
`;

const StyledTableHeader = styled.th`
  background: ${({ theme }) => theme.background.tertiary};
  border-bottom: 1px solid ${({ theme }) => theme.border.color.medium};
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  padding: ${({ theme }) => theme.spacing(4)};
  text-align: left;
`;

const StyledTableCell = styled.td`
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.md};
  padding: ${({ theme }) => theme.spacing(4)};
`;

const StyledStatus = styled.span<{ status: string }>`
  padding: ${({ theme }) => theme.spacing(1)} ${({ theme }) => theme.spacing(2)};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  background: ${({ status }) => {
    switch (status) {
      case 'ENABLED':
        return '#d1fae5';
      case 'PAUSED':
        return '#fef3c7';
      case 'REMOVED':
        return '#fee2e2';
      default:
        return '#e5e7eb';
    }
  }};
  color: ${({ status }) => {
    switch (status) {
      case 'ENABLED':
        return '#065f46';
      case 'PAUSED':
        return '#92400e';
      case 'REMOVED':
        return '#991b1b';
      default:
        return '#374151';
    }
  }};
`;

export const MarketingDashboard = () => {
  const { t } = useLingui();
  const navigate = useNavigate();
  const { campaigns, loading, hasAccounts } = useMarketingDashboardData();

  if (loading) {
    return (
      <PageContainer>
        <PageHeader title={t`Marketing Dashboard`} />
        <PageBody>
          <StyledDashboardContainer>
            <Loader />
          </StyledDashboardContainer>
        </PageBody>
      </PageContainer>
    );
  }

  if (!hasAccounts) {
    return (
      <PageContainer>
        <PageHeader title={t`Marketing Dashboard`} />
        <PageBody>
          <StyledEmptyState>
            <IconAlertCircle size={64} />
            <h2>
              <Trans>Nenhuma conta conectada</Trans>
            </h2>
            <StyledEmptyStateText>
              <Trans>
                Conecte sua conta Google Ads ou Meta Ads para começar a
                visualizar suas campanhas e métricas.
              </Trans>
            </StyledEmptyStateText>
            <Button
              title={t`Conectar Conta`}
              onClick={() =>
                navigate(
                  getSettingsPath(SettingsPath.Integrations) + '/marketing',
                )
              }
            />
          </StyledEmptyState>
        </PageBody>
      </PageContainer>
    );
  }

  if (campaigns.length === 0) {
    return (
      <PageContainer>
        <PageHeader title={t`Marketing Dashboard`} />
        <PageBody>
          <StyledEmptyState>
            <IconAlertCircle size={64} />
            <h2>
              <Trans>Nenhuma campanha encontrada</Trans>
            </h2>
            <StyledEmptyStateText>
              <Trans>
                Configure suas contas de anúncios nas integrações para
                visualizar campanhas.
              </Trans>
            </StyledEmptyStateText>
            <Button
              title={t`Configurar Contas`}
              onClick={() =>
                navigate(
                  getSettingsPath(SettingsPath.Integrations) + '/marketing',
                )
              }
            />
          </StyledEmptyState>
        </PageBody>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader title={t`Marketing Dashboard`} />
      <PageBody>
        <StyledDashboardContainer>
          <div>
            <h2>
              <Trans>Campanhas Ativas</Trans>
            </h2>
            <p>
              <Trans>Total: {campaigns.length} campanha(s)</Trans>
            </p>
          </div>

          <StyledCampaignsTable>
            <thead>
              <tr>
                <StyledTableHeader>
                  <Trans>Nome</Trans>
                </StyledTableHeader>
                <StyledTableHeader>
                  <Trans>Plataforma</Trans>
                </StyledTableHeader>
                <StyledTableHeader>
                  <Trans>Status</Trans>
                </StyledTableHeader>
                <StyledTableHeader>
                  <Trans>Moeda</Trans>
                </StyledTableHeader>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((campaign: any) => (
                <tr key={campaign.id}>
                  <StyledTableCell>{campaign.name}</StyledTableCell>
                  <StyledTableCell>{campaign.platform}</StyledTableCell>
                  <StyledTableCell>
                    <StyledStatus status={campaign.status}>
                      {campaign.status}
                    </StyledStatus>
                  </StyledTableCell>
                  <StyledTableCell>{campaign.currencyCode}</StyledTableCell>
                </tr>
              ))}
            </tbody>
          </StyledCampaignsTable>
        </StyledDashboardContainer>
      </PageBody>
    </PageContainer>
  );
};
