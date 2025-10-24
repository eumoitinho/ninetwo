import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { useEffect, useState } from 'react';

import { type MarketingChannel } from '@/marketing/types/MarketingChannel';
import { H2Title, H3Title } from 'ninetwo-ui/display';
import { Loader } from 'ninetwo-ui/feedback';
import { Button, Checkbox } from 'ninetwo-ui/input';
import { Card, CardContent, Section } from 'ninetwo-ui/layout';

type GoogleAdsAccount = {
  id: string;
  name: string;
  customerId: string;
  isMCC: boolean;
  canManageClients: boolean;
};

const StyledAccountCard = styled(CardContent)<{ selected?: boolean }>`
  cursor: pointer;
  border: 2px solid
    ${({ selected, theme }) =>
      selected ? theme.color.blue : 'transparent'};

  &:hover {
    background: ${({ theme }) => theme.background.transparent.lighter};
  }
`;

const StyledAccountHeader = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(4)};
  justify-content: space-between;
`;

const StyledAccountInfo = styled.div`
  flex: 1;
`;

const StyledAccountName = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  margin-bottom: ${({ theme }) => theme.spacing(1)};
`;

const StyledAccountId = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.sm};
`;

const StyledChildAccounts = styled.div`
  margin-left: ${({ theme }) => theme.spacing(6)};
  margin-top: ${({ theme }) => theme.spacing(3)};
  padding-left: ${({ theme }) => theme.spacing(3)};
  border-left: 2px solid ${({ theme }) => theme.border.color.medium};
`;

const StyledLoadingContainer = styled.div`
  align-items: center;
  display: flex;
  height: 200px;
  justify-content: center;
`;

type SettingsMarketingGoogleAdsAccountSelectorProps = {
  marketingChannel: MarketingChannel;
  onAccountsSelected: (accountIds: string[]) => void;
};

export const SettingsMarketingGoogleAdsAccountSelector = ({
  marketingChannel,
  onAccountsSelected,
}: SettingsMarketingGoogleAdsAccountSelectorProps) => {
  const { t } = useLingui();
  const [accounts, setAccounts] = useState<GoogleAdsAccount[]>([]);
  const [mccChildAccounts, setMccChildAccounts] = useState<
    Record<string, GoogleAdsAccount[]>
  >({});
  const [selectedAccountIds, setSelectedAccountIds] = useState<Set<string>>(
    new Set(),
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        // TODO: Call GraphQL query to get Google Ads accounts
        // const response = await getGoogleAdsAccounts({
        //   variables: { connectedAccountId: marketingChannel.connectedAccountId },
        // });
        // setAccounts(JSON.parse(response.data));

        // Mock data for now
        setAccounts([
          {
            id: '123-456-7890',
            name: 'Main Account',
            customerId: '123-456-7890',
            isMCC: true,
            canManageClients: true,
          },
          {
            id: '987-654-3210',
            name: 'Campaign Account',
            customerId: '987-654-3210',
            isMCC: false,
            canManageClients: false,
          },
        ]);
      } catch (error) {
        console.error('Error fetching Google Ads accounts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAccounts();
  }, [marketingChannel.connectedAccountId]);

  const toggleAccountSelection = (accountId: string) => {
    const newSelection = new Set(selectedAccountIds);
    if (newSelection.has(accountId)) {
      newSelection.delete(accountId);
    } else {
      newSelection.add(accountId);
    }
    setSelectedAccountIds(newSelection);
    onAccountsSelected(Array.from(newSelection));
  };

  const loadMCCChildAccounts = async (mccId: string) => {
    if (mccChildAccounts[mccId]) {
      return; // Already loaded
    }

    try {
      // TODO: Call GraphQL query to get MCC child accounts
      // const response = await getMCCChildAccounts({
      //   variables: {
      //     connectedAccountId: marketingChannel.connectedAccountId,
      //     mccCustomerId: mccId,
      //   },
      // });
      // setMccChildAccounts(prev => ({
      //   ...prev,
      //   [mccId]: JSON.parse(response.data),
      // }));

      // Mock data
      setMccChildAccounts((prev) => ({
        ...prev,
        [mccId]: [
          {
            id: `${mccId}-child-1`,
            name: 'Child Account 1',
            customerId: `${mccId}-child-1`,
            isMCC: false,
            canManageClients: false,
          },
          {
            id: `${mccId}-child-2`,
            name: 'Child Account 2',
            customerId: `${mccId}-child-2`,
            isMCC: false,
            canManageClients: false,
          },
        ],
      }));
    } catch (error) {
      console.error('Error loading MCC child accounts:', error);
    }
  };

  if (loading) {
    return (
      <Section>
        <StyledLoadingContainer>
          <Loader />
        </StyledLoadingContainer>
      </Section>
    );
  }

  return (
    <Section>
      <H2Title
        title={t`Select Google Ads Accounts`}
        description={t`Choose which Google Ads accounts you want to sync. For MCC accounts, you can select individual child accounts.`}
      />

      <Card rounded>
        {accounts.map((account) => (
          <div key={account.id}>
            <StyledAccountCard
              selected={selectedAccountIds.has(account.id)}
              onClick={() => toggleAccountSelection(account.id)}
              divider
            >
              <StyledAccountHeader>
                <StyledAccountInfo>
                  <StyledAccountName>
                    {account.name}
                    {account.isMCC && t` (MCC)`}
                  </StyledAccountName>
                  <StyledAccountId>{account.customerId}</StyledAccountId>
                </StyledAccountInfo>
                <Checkbox
                  checked={selectedAccountIds.has(account.id)}
                  onChange={() => toggleAccountSelection(account.id)}
                />
              </StyledAccountHeader>
            </StyledAccountCard>

            {account.isMCC && selectedAccountIds.has(account.id) && (
              <StyledChildAccounts>
                <H3Title
                  title={t`MCC Child Accounts`}
                  description={t`Select individual accounts from this MCC`}
                />
                {mccChildAccounts[account.id] ? (
                  <Card rounded>
                    {mccChildAccounts[account.id].map((childAccount) => (
                      <StyledAccountCard
                        key={childAccount.id}
                        selected={selectedAccountIds.has(childAccount.id)}
                        onClick={() => toggleAccountSelection(childAccount.id)}
                        divider
                      >
                        <StyledAccountHeader>
                          <StyledAccountInfo>
                            <StyledAccountName>
                              {childAccount.name}
                            </StyledAccountName>
                            <StyledAccountId>
                              {childAccount.customerId}
                            </StyledAccountId>
                          </StyledAccountInfo>
                          <Checkbox
                            checked={selectedAccountIds.has(childAccount.id)}
                            onChange={() =>
                              toggleAccountSelection(childAccount.id)
                            }
                          />
                        </StyledAccountHeader>
                      </StyledAccountCard>
                    ))}
                  </Card>
                ) : (
                  <Button
                    title={t`Load child accounts`}
                    variant="secondary"
                    size="small"
                    onClick={() => loadMCCChildAccounts(account.id)}
                  />
                )}
              </StyledChildAccounts>
            )}
          </div>
        ))}
      </Card>
    </Section>
  );
};

