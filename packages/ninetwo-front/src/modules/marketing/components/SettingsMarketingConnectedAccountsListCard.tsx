import { type ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import { SettingsConnectedAccountsTableHeader } from '@/settings/accounts/components/SettingsConnectedAccountsTableHeader';
import { SettingsConnectedAccountsTableRow } from '@/settings/components/SettingsConnectedAccountsTableRow';
import { Table } from '@/ui/layout/table/components/Table';
import styled from '@emotion/styled';
import { ConnectedAccountProvider, SettingsPath } from 'ninetwo-shared/types';

import { useLingui } from '@lingui/react/macro';
import { IconPlus } from 'ninetwo-ui/display';

import { Button } from 'ninetwo-ui/input';
import { Section } from 'ninetwo-ui/layout';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

const StyledTableRows = styled.div`
  padding-bottom: ${({ theme }) => theme.spacing(2)};
  padding-top: ${({ theme }) => theme.spacing(2)};
`;

const StyledAddAccountSection = styled(Section)`
  border-top: 1px solid ${({ theme }) => theme.border.color.light};
  display: flex;
  justify-content: flex-end;
  padding-top: ${({ theme }) => theme.spacing(2)};
`;

const StyledEmptyState = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.tertiary};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(8)};
  text-align: center;
`;

export const SettingsMarketingConnectedAccountsListCard = ({
  accounts,
  provider,
}: {
  accounts: ConnectedAccount[];
  provider: ConnectedAccountProvider;
}) => {
  const { t } = useLingui();
  const navigateSettings = useNavigateSettings();

  const getAddPath = () => {
    switch (provider) {
      case ConnectedAccountProvider.GOOGLE_ADS:
        return SettingsPath.NewMarketingGoogleAds;
      case ConnectedAccountProvider.GOOGLE_ANALYTICS:
        return SettingsPath.NewMarketingGoogleAnalytics;
      case ConnectedAccountProvider.META_ADS:
        return SettingsPath.NewMarketingMetaAds;
      default:
        return SettingsPath.IntegrationsMarketing;
    }
  };

  if (!accounts.length) {
    return (
      <Section>
        <StyledEmptyState>
          {t`No marketing accounts connected yet. Connect to get started.`}
        </StyledEmptyState>
        <StyledAddAccountSection>
          <Button
            Icon={IconPlus}
            title={t`Connect account`}
            variant="primary"
            size="small"
            accent="blue"
            onClick={() => navigateSettings(getAddPath())}
          />
        </StyledAddAccountSection>
      </Section>
    );
  }

  return (
    <Section>
      <Table>
        <SettingsConnectedAccountsTableHeader />
        <StyledTableRows>
          {accounts.map((account) => (
            <SettingsConnectedAccountsTableRow
              key={account.id}
              account={account}
            />
          ))}
        </StyledTableRows>
      </Table>
      <StyledAddAccountSection>
        <Button
          Icon={IconPlus}
          title={t`Add account`}
          variant="secondary"
          size="small"
          onClick={() => navigateSettings(getAddPath())}
        />
      </StyledAddAccountSection>
    </Section>
  );
};

