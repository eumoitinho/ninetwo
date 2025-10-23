export type MarketingPlatform = 'GOOGLE_ADS' | 'GOOGLE_ANALYTICS' | 'META_ADS';

export type MarketingIntegrationStatus =
  | 'CONNECTED'
  | 'NOT_CONNECTED'
  | 'CONFIGURING';

export type MarketingIntegration = {
  platform: MarketingPlatform;
  name: string;
  description: string;
  icon: string;
  status: MarketingIntegrationStatus;
  connectedAccountId?: string;
  configuredAccounts?: string[];
};

export type AdAccount = {
  id: string;
  name: string;
  type: 'REGULAR' | 'MCC' | 'BUSINESS_MANAGER';
  platform: string;
  currencyCode: string;
  timezone?: string;
};

export type WizardStep =
  | 'SELECT_PLATFORM'
  | 'OAUTH'
  | 'SELECT_ACCOUNTS'
  | 'CONFIGURE'
  | 'COMPLETE';
