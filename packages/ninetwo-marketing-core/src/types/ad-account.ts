export type AdAccountType = 'REGULAR' | 'MCC' | 'BUSINESS_MANAGER';

export type AdAccount = {
  id: string;
  name: string;
  type: AdAccountType;
  platform: string;
  currencyCode: string;
  timezone?: string;
};

export type MCCAccount = AdAccount & {
  type: 'MCC';
  childAccounts: AdAccount[];
};

export type BusinessManagerAccount = AdAccount & {
  type: 'BUSINESS_MANAGER';
  adAccounts: AdAccount[];
};

export type AdAccountsResult = {
  accounts: AdAccount[];
  managerAccountId?: string;
};

