export type AdsCampaign = {
  id: string;
  name: string;
  externalId: string;
  status: string;
  advertisingChannelType?: string;
  budget?: number;
  impressions?: number;
  clicks?: number;
  costMicros?: number;
  conversions?: number;
  conversionValue?: number;
  ctr?: number;
  averageCpc?: number;
  averageCpa?: number;
  roas?: number;
  customerId: string;
  startDate?: string;
  endDate?: string;
  lastSyncedAt?: Date;
  marketingChannelId: string;
  createdAt: Date;
  updatedAt: Date;
};

