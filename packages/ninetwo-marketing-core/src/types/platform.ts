export type MarketingPlatform = 'GOOGLE_ADS' | 'GOOGLE_ANALYTICS' | 'META_ADS';

export const MARKETING_PLATFORMS = {
  GOOGLE_ADS: 'GOOGLE_ADS' as const,
  GOOGLE_ANALYTICS: 'GOOGLE_ANALYTICS' as const,
  META_ADS: 'META_ADS' as const,
};

export type MarketingPlatformLabel = {
  [K in MarketingPlatform]: string;
};

export const MARKETING_PLATFORM_LABELS: MarketingPlatformLabel = {
  GOOGLE_ADS: 'Google Ads',
  GOOGLE_ANALYTICS: 'Google Analytics',
  META_ADS: 'Meta Ads',
};

