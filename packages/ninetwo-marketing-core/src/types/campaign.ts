export type CampaignStatus =
  | 'ACTIVE'
  | 'PAUSED'
  | 'REMOVED'
  | 'ENABLED'
  | 'DISABLED'
  | 'ARCHIVED';

export type Campaign = {
  id: string;
  name: string;
  platform: string;
  externalId: string;
  status: CampaignStatus;
  dailyBudget?: number;
  totalBudget?: number;
  currencyCode: string;
  connectedAccountId: string;
  createdAt?: Date;
  updatedAt?: Date;
};

export type MoneyAmount = {
  amountMicros: number;
  currencyCode: string;
};

export type CampaignMetrics = {
  campaignId: string;
  label: string;
  date: Date;
  platform: string;

  // Segmentation
  device?: string;
  adNetworkType?: string;
  placement?: string;

  // Core metrics
  currencyCode: string;
  impressions: number;
  clicks: number;
  conversions: number;
  conversionsValue?: number;

  // Costs
  cost: MoneyAmount;
  cpc: MoneyAmount | null;
  cpa: MoneyAmount | null;
  cpm?: number;

  // Performance
  ctr?: number;
  conversionRate?: number;
  roas: number | null;

  // Additional metrics
  interactions?: number;
  interactionRate?: number;
  videoViews?: number;
  videoViewRate?: number;
  allConversions?: number;
  allConversionsValue?: number;
  viewThroughConversions?: number;
};

export type MetricGroupBy = 'day' | 'week' | 'month' | 'campaign' | 'device' | 'placement';

export type DateRange = {
  from: string; // YYYY-MM-DD
  to: string; // YYYY-MM-DD
};

