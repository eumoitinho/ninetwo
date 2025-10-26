export type AnalyticsData = {
  id: string;
  date: string;
  propertyId: string;
  sessions?: number;
  totalUsers?: number;
  newUsers?: number;
  activeUsers?: number;
  screenPageViews?: number;
  screenPageViewsPerSession?: number;
  averageSessionDuration?: number;
  bounceRate?: number;
  engagementRate?: number;
  engagedSessions?: number;
  conversions?: number;
  totalRevenue?: number;
  ecommercePurchases?: number;
  purchaseRevenue?: number;
  sessionSource?: string;
  sessionMedium?: string;
  sessionCampaign?: string;
  deviceCategory?: string;
  country?: string;
  city?: string;
  landingPage?: string;
  marketingChannelId: string;
  createdAt: Date;
  updatedAt: Date;
};


