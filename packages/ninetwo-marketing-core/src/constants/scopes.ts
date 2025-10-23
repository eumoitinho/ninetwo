export const GOOGLE_ADS_SCOPES = [
  'https://www.googleapis.com/auth/adwords',
] as const;

export const GOOGLE_ANALYTICS_SCOPES = [
  'https://www.googleapis.com/auth/analytics.readonly',
] as const;

export const META_ADS_SCOPES = ['ads_read', 'ads_management'] as const;

export const MARKETING_OAUTH_SCOPES = {
  GOOGLE_ADS: GOOGLE_ADS_SCOPES,
  GOOGLE_ANALYTICS: GOOGLE_ANALYTICS_SCOPES,
  META_ADS: META_ADS_SCOPES,
} as const;

