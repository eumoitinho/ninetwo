import styled from '@emotion/styled';
import { Trans, useLingui } from '@lingui/react/macro';

import { IconCheck, IconX } from 'ninetwo-ui/display';
import { Button } from 'ninetwo-ui/input';
import { Card } from 'ninetwo-ui/layout';

import { type MarketingPlatform } from '../types/MarketingIntegration';

type MarketingIntegrationCardProps = {
  platform: MarketingPlatform;
  name: string;
  description: string;
  Icon: React.ElementType;
  logoUrl?: string;
  isConnected: boolean;
  onConnect: () => void;
  onManage?: () => void;
  onReconnect?: () => void;
};

const StyledCard = styled(Card)`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
  padding: ${({ theme }) => theme.spacing(6)};
`;

const StyledHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(3)};
`;

const StyledIconContainer = styled.div<{ isConnected: boolean }>`
  align-items: center;
  background-color: ${({ theme, isConnected }) =>
    isConnected ? theme.accent.tertiary : theme.background.secondary};
  border-radius: ${({ theme }) => theme.border.radius.md};
  color: ${({ theme, isConnected }) =>
    isConnected ? theme.accent.accent4060 : theme.font.color.secondary};
  display: flex;
  height: ${({ theme }) => theme.spacing(16)};
  justify-content: center;
  width: ${({ theme }) => theme.spacing(16)};
  flex-shrink: 0;
  padding: ${({ theme }) => theme.spacing(2)};
`;

const StyledLogo = styled.img`
  height: 100%;
  object-fit: contain;
  width: 100%;
`;

const StyledContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledTitle = styled.h3`
  margin: 0;
  font-size: ${({ theme }) => theme.font.size.lg};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  color: ${({ theme }) => theme.font.color.primary};
`;

const StyledDescription = styled.p`
  margin: 0;
  font-size: ${({ theme }) => theme.font.size.sm};
  color: ${({ theme }) => theme.font.color.secondary};
  line-height: 1.5;
`;

const StyledStatusBadge = styled.div<{ isConnected: boolean }>`
  align-items: center;
  background-color: ${({ theme, isConnected }) =>
    isConnected ? theme.accent.tertiary : theme.background.transparent.light};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: ${({ theme, isConnected }) =>
    isConnected ? theme.accent.accent4060 : theme.font.color.tertiary};
  display: inline-flex;
  font-size: ${({ theme }) => theme.font.size.xs};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  gap: ${({ theme }) => theme.spacing(1)};
  padding: ${({ theme }) => theme.spacing(1)} ${({ theme }) => theme.spacing(2)};
`;

const StyledActions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  margin-top: ${({ theme }) => theme.spacing(2)};
`;

export const MarketingIntegrationCard = ({
  platform: _platform,
  name,
  description,
  Icon,
  logoUrl,
  isConnected,
  onConnect,
  onManage,
  onReconnect,
}: MarketingIntegrationCardProps) => {
  const { t } = useLingui();

  return (
    <StyledCard>
      <StyledHeader>
        <StyledIconContainer isConnected={isConnected}>
          {logoUrl ? (
            <StyledLogo src={logoUrl} alt={name} />
          ) : (
            <Icon size={32} />
          )}
        </StyledIconContainer>
        <StyledContent>
          <StyledTitle>{name}</StyledTitle>
          <StyledStatusBadge isConnected={isConnected}>
            {isConnected ? (
              <>
                <IconCheck size={14} />
                <Trans>Connected</Trans>
              </>
            ) : (
              <>
                <IconX size={14} />
                <Trans>Not connected</Trans>
              </>
            )}
          </StyledStatusBadge>
        </StyledContent>
      </StyledHeader>

      <StyledDescription>{description}</StyledDescription>

      <StyledActions>
        {!isConnected ? (
          <Button
            variant="primary"
            accent="default"
            title={t`Connect account`}
            onClick={onConnect}
          />
        ) : (
          <>
            <Button
              variant="secondary"
              accent="default"
              title={t`Manage`}
              onClick={onManage}
            />
            {onReconnect && (
              <Button
                variant="secondary"
                accent="blue"
                title={t`Reconnect`}
                onClick={onReconnect}
              />
            )}
            <Button
              variant="secondary"
              accent="danger"
              title={t`Disconnect`}
              onClick={() => {
                // TODO: implement disconnect
              }}
            />
          </>
        )}
      </StyledActions>
    </StyledCard>
  );
};
