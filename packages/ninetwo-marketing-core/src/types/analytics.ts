export type AnalyticsProperty = {
  propertyId: string;
  displayName: string;
  accountId?: string;
};

export type AnalyticsAccount = {
  accountId: string;
  displayName: string;
  properties: AnalyticsProperty[];
};

export type AnalyticsSession = {
  label: string;
  date: Date;
  propertyId: string;

  // Core metrics
  sessions: number;
  users: number;
  newUsers: number;
  pageViews: number;

  // Engagement
  bounceRate: number | null;
  avgSessionDuration: number | null;

  // Conversions
  conversionRate: number | null;
  goalCompletions: number | null;

  // Traffic source
  source: string | null;
  medium: string | null;
  campaign: string | null;

  connectedAccountId: string;
};

export type AnalyticsAccountsResult = {
  accounts: AnalyticsAccount[];
};

