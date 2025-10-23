import styled from '@emotion/styled';
import { Trans, useLingui } from '@lingui/react/macro';
import { IconAlertCircle, IconCheck } from '@tabler/icons-react';

import { Button } from 'ninetwo-ui/input';
import { Card } from 'ninetwo-ui/layout';

import { type AdAccount } from '../types/MarketingIntegration';

type GoogleAdsAccountSelectorProps = {
  accounts: AdAccount[];
  managerAccountId?: string;
  selectedAccountIds: string[];
  onSelectionChange: (accountIds: string[]) => void;
  onConfirm: () => void;
  onCancel?: () => void;
  isLoading?: boolean;
};

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
`;

const StyledAccountsGrid = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing(3)};
`;

const StyledAccountCard = styled(Card)<{ isSelected: boolean }>`
  padding: ${({ theme }) => theme.spacing(4)};
  cursor: pointer;
  border: 2px solid
    ${({ theme, isSelected }) =>
      isSelected ? theme.accent.accent4060 : theme.border.color.medium};
  background-color: ${({ theme, isSelected }) =>
    isSelected ? theme.accent.tertiary : theme.background.primary};
  transition: all 0.2s ease;

  &:hover {
    border-color: ${({ theme }) => theme.accent.accent3570};
    background-color: ${({ theme }) => theme.accent.tertiary};
  }
`;

const StyledAccountInfo = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const StyledAccountDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const StyledAccountName = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.medium};
`;

const StyledAccountMeta = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.sm};
`;

const StyledCheckIcon = styled.div<{ isSelected: boolean }>`
  align-items: center;
  background-color: ${({ theme, isSelected }) =>
    isSelected ? theme.accent.accent4060 : theme.background.transparent.light};
  border-radius: 50%;
  color: ${({ theme, isSelected }) =>
    isSelected ? theme.background.primary : theme.font.color.tertiary};
  display: flex;
  height: 24px;
  justify-content: center;
  width: 24px;
`;

const StyledInfoBox = styled.div`
  padding: ${({ theme }) => theme.spacing(4)};
  background-color: ${({ theme }) => theme.accent.tertiary};
  border-left: 4px solid ${({ theme }) => theme.accent.accent4060};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  display: flex;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing(3)};
`;

const StyledInfoText = styled.div`
  font-size: ${({ theme }) => theme.font.size.sm};
  color: ${({ theme }) => theme.font.color.secondary};
  line-height: 1.5;
`;

const StyledActions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(3)};
  justify-content: flex-end;
  margin-top: ${({ theme }) => theme.spacing(4)};
`;

export const GoogleAdsAccountSelector = ({
  accounts,
  managerAccountId,
  selectedAccountIds,
  onSelectionChange,
  onConfirm,
  onCancel,
  isLoading = false,
}: GoogleAdsAccountSelectorProps) => {
  const { t } = useLingui();

  const toggleAccount = (accountId: string) => {
    if (selectedAccountIds.includes(accountId)) {
      onSelectionChange(selectedAccountIds.filter((id) => id !== accountId));
    } else {
      onSelectionChange([...selectedAccountIds, accountId]);
    }
  };

  const selectAll = () => {
    onSelectionChange(accounts.map((acc) => acc.id));
  };

  const deselectAll = () => {
    onSelectionChange([]);
  };

  return (
    <StyledContainer>
      {managerAccountId && (
        <StyledInfoBox>
          <IconAlertCircle size={20} />
          <StyledInfoText>
            <Trans>
              Conta MCC detectada (ID: {managerAccountId}). Selecione abaixo as
              contas cliente que deseja sincronizar.
            </Trans>
          </StyledInfoText>
        </StyledInfoBox>
      )}

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ fontSize: '14px', color: '#666' }}>
          <Trans>
            {selectedAccountIds.length} de {accounts.length} contas selecionadas
          </Trans>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Button
            variant="tertiary"
            size="small"
            title={t`Selecionar todas`}
            onClick={selectAll}
          />
          <Button
            variant="tertiary"
            size="small"
            title={t`Desmarcar todas`}
            onClick={deselectAll}
          />
        </div>
      </div>

      <StyledAccountsGrid>
        {accounts.map((account) => {
          const isSelected = selectedAccountIds.includes(account.id);

          return (
            <StyledAccountCard
              key={account.id}
              isSelected={isSelected}
              onClick={() => toggleAccount(account.id)}
            >
              <StyledAccountInfo>
                <StyledAccountDetails>
                  <StyledAccountName>{account.name}</StyledAccountName>
                  <StyledAccountMeta>
                    ID: {account.id} • {account.currencyCode}
                    {account.timezone && ` • ${account.timezone}`}
                  </StyledAccountMeta>
                </StyledAccountDetails>
                <StyledCheckIcon isSelected={isSelected}>
                  {isSelected && <IconCheck size={16} />}
                </StyledCheckIcon>
              </StyledAccountInfo>
            </StyledAccountCard>
          );
        })}
      </StyledAccountsGrid>

      <StyledActions>
        <Button
          variant="secondary"
          title={t`Cancelar`}
          onClick={onCancel || (() => window.history.back())}
        />
        <Button
          variant="primary"
          title={t`Confirmar e sincronizar`}
          onClick={onConfirm}
          disabled={selectedAccountIds.length === 0 || isLoading}
        />
      </StyledActions>
    </StyledContainer>
  );
};
