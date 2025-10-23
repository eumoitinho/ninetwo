import { type MoneyAmount } from '../types/campaign';

// Convert micros (used by Google Ads) to decimal amount
export const convertMicrosToDecimal = (micros: number): number => {
  return micros / 1_000_000;
};

// Convert decimal to micros
export const convertDecimalToMicros = (amount: number): number => {
  return Math.round(amount * 1_000_000);
};

// Calculate ROAS (Return on Ad Spend)
export const calculateROAS = (
  conversionsValue: number,
  cost: MoneyAmount,
): number | null => {
  const costDecimal = convertMicrosToDecimal(cost.amountMicros);

  if (costDecimal === 0) {
    return null;
  }

  return conversionsValue / costDecimal;
};

// Calculate CTR (Click-Through Rate) as percentage
export const calculateCTR = (clicks: number, impressions: number): number => {
  if (impressions === 0) {
    return 0;
  }

  return (clicks / impressions) * 100;
};

// Calculate Conversion Rate as percentage
export const calculateConversionRate = (
  conversions: number,
  clicks: number,
): number => {
  if (clicks === 0) {
    return 0;
  }

  return (conversions / clicks) * 100;
};

// Calculate CPC (Cost Per Click)
export const calculateCPC = (
  costMicros: number,
  clicks: number,
  currencyCode: string,
): MoneyAmount | null => {
  if (clicks === 0) {
    return null;
  }

  return {
    amountMicros: Math.round(costMicros / clicks),
    currencyCode,
  };
};

// Calculate CPA (Cost Per Acquisition)
export const calculateCPA = (
  costMicros: number,
  conversions: number,
  currencyCode: string,
): MoneyAmount | null => {
  if (conversions === 0) {
    return null;
  }

  return {
    amountMicros: Math.round(costMicros / conversions),
    currencyCode,
  };
};

// Format money amount for display
export const formatMoneyAmount = (
  amount: MoneyAmount,
  locale: string = 'pt-BR',
): string => {
  const decimalAmount = convertMicrosToDecimal(amount.amountMicros);

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: amount.currencyCode,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(decimalAmount);
};

// Format percentage
export const formatPercentage = (value: number, decimals: number = 2): string => {
  return `${value.toFixed(decimals)}%`;
};

// Format large numbers (K, M, B)
export const formatCompactNumber = (
  value: number,
  locale: string = 'pt-BR',
): string => {
  return new Intl.NumberFormat(locale, {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
};

