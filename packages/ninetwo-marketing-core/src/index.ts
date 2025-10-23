// Types
export type {
    AdAccount, AdAccountType, AdAccountsResult, BusinessManagerAccount,
    MCCAccount
} from './types/ad-account';
export type {
    AnalyticsAccount,
    AnalyticsAccountsResult,
    AnalyticsProperty,
    AnalyticsSession
} from './types/analytics';
export type {
    Campaign,
    CampaignMetrics,
    CampaignStatus,
    DateRange,
    MetricGroupBy,
    MoneyAmount
} from './types/campaign';
export {
    MARKETING_PLATFORMS, MARKETING_PLATFORM_LABELS, type MarketingPlatform,
    type MarketingPlatformLabel
} from './types/platform';

// Constants
export {
    GOOGLE_ADS_SCOPES,
    GOOGLE_ANALYTICS_SCOPES,
    MARKETING_OAUTH_SCOPES,
    META_ADS_SCOPES
} from './constants';

// Utils
export {
    calculateCPA,
    calculateCPC,
    calculateCTR, calculateConversionRate, calculateROAS,
    convertDecimalToMicros,
    convertMicrosToDecimal,
    formatCompactNumber,
    formatMoneyAmount,
    formatPercentage
} from './utils';

