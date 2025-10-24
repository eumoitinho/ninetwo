export enum MarketingChannelSyncStatus {
  NOT_SYNCED = 'NOT_SYNCED',
  ONGOING = 'ONGOING',
  ACTIVE = 'ACTIVE',
  FAILED_INSUFFICIENT_PERMISSIONS = 'FAILED_INSUFFICIENT_PERMISSIONS',
  FAILED_UNKNOWN = 'FAILED_UNKNOWN',
}

export enum MarketingChannelSyncStage {
  PENDING_CONFIGURATION = 'PENDING_CONFIGURATION',
  ACCOUNT_SELECTION_PENDING = 'ACCOUNT_SELECTION_PENDING',
  DATA_FETCH_PENDING = 'DATA_FETCH_PENDING',
  DATA_FETCH_SCHEDULED = 'DATA_FETCH_SCHEDULED',
  DATA_FETCH_ONGOING = 'DATA_FETCH_ONGOING',
  DATA_IMPORT_PENDING = 'DATA_IMPORT_PENDING',
  DATA_IMPORT_SCHEDULED = 'DATA_IMPORT_SCHEDULED',
  DATA_IMPORT_ONGOING = 'DATA_IMPORT_ONGOING',
  FAILED = 'FAILED',
}

export enum MarketingChannelType {
  GOOGLE_ADS = 'google-ads',
  GOOGLE_ANALYTICS = 'google-analytics',
  META_ADS = 'meta-ads',
}

export type MarketingChannel = {
  id: string;
  handle: string;
  type: MarketingChannelType;
  syncStatus: MarketingChannelSyncStatus | null;
  syncStage: MarketingChannelSyncStage | null;
  syncedAt: string | null;
  isSyncEnabled: boolean;
  throttleFailureCount: number;
  accountConfig: Record<string, any> | null;
  connectedAccountId: string;
  createdAt: string;
  updatedAt: string;
  __typename: 'MarketingChannel';
};

