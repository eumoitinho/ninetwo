import styled from '@emotion/styled';
import { type ComponentType } from 'react';
import {
  type MoneyAmount,
  formatCompactNumber,
  formatMoneyAmount,
} from 'ninetwo-marketing-core';

type IconComponent = ComponentType<{ size?: number; color?: string }>;

type MetricCardProps = {
  title: string;
  value: number | MoneyAmount;
  Icon: IconComponent;
  percentageChange?: number;
  previousValue?: number;
  formatType?: 'number' | 'money' | 'compact';
  locale?: string;
};

const StyledCard = styled.div`
  background-color: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  transition: all 0.2s ease;

  &:hover {
    border-color: #f54bd0;
    box-shadow: 0 2px 8px rgba(245, 75, 208, 0.15);
  }
`;

const StyledHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const StyledIconContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 6px;
  background-color: #fce7f6;
  color: #f54bd0;
`;

const StyledTitle = styled.div`
  font-size: 12px;
  font-weight: 500;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const StyledValue = styled.div`
  font-size: 28px;
  font-weight: 600;
  color: #111827;
`;

const StyledChange = styled.div<{ isPositive: boolean }>`
  font-size: 14px;
  color: ${({ isPositive }) => (isPositive ? '#10b981' : '#ef4444')};
  display: flex;
  align-items: center;
  gap: 4px;
`;

export const MetricCard = ({
  title,
  value,
  Icon,
  percentageChange,
  formatType = 'number',
  locale = 'pt-BR',
}: MetricCardProps) => {
  const formattedValue = (() => {
    if (formatType === 'money' && typeof value === 'object') {
      return formatMoneyAmount(value);
    }
    if (formatType === 'compact' && typeof value === 'number') {
      return formatCompactNumber(value, locale);
    }
    if (typeof value === 'number') {
      return new Intl.NumberFormat(locale).format(value);
    }
    return String(value);
  })();

  const changePrefix = percentageChange
    ? percentageChange > 0
      ? '+'
      : ''
    : '';

  return (
    <StyledCard>
      <StyledHeader>
        <StyledIconContainer>
          <Icon size={24} />
        </StyledIconContainer>
        <StyledTitle>{title}</StyledTitle>
      </StyledHeader>
      <StyledValue>{formattedValue}</StyledValue>
      {percentageChange !== undefined && (
        <StyledChange isPositive={percentageChange >= 0}>
          {changePrefix}
          {percentageChange.toFixed(1)}% vs período anterior
        </StyledChange>
      )}
    </StyledCard>
  );
};
