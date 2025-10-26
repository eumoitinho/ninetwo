import styled from '@emotion/styled';

import { Card } from 'ninetwo-ui/layout';

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

const StyledMetricChange = styled.div<{ positive?: boolean }>`
  color: ${({ theme, positive }) =>
    positive ? theme.color.green : theme.color.red};
  font-size: ${({ theme }) => theme.font.size.xs};
  margin-top: ${({ theme }) => theme.spacing(1)};
`;

type MarketingKPICardProps = {
  label: string;
  value: string | number;
  change?: number;
  format?: 'currency' | 'percentage' | 'number';
};

export const MarketingKPICard = ({
  label,
  value,
  change,
  format = 'number',
}: MarketingKPICardProps) => {
  const formatValue = (val: string | number) => {
    if (typeof val === 'string') return val;

    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        }).format(val);
      case 'percentage':
        return `${val.toFixed(2)}%`;
      default:
        return new Intl.NumberFormat('pt-BR').format(Math.round(val));
    }
  };

  return (
    <StyledMetricCard>
      <StyledMetricLabel>{label}</StyledMetricLabel>
      <StyledMetricValue>{formatValue(value)}</StyledMetricValue>
      {change !== undefined && change !== null && (
        <StyledMetricChange positive={change >= 0}>
          {change >= 0 ? '+' : ''}
          {change.toFixed(1)}% vs período anterior
        </StyledMetricChange>
      )}
    </StyledMetricCard>
  );
};


