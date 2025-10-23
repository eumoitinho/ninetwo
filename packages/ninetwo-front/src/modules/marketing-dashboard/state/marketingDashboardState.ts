import { atom } from 'recoil';

export type DateRangePreset =
  | 'today'
  | 'yesterday'
  | 'last7days'
  | 'last30days'
  | 'last90days'
  | 'custom';

export type MarketingDateRange = {
  from: string; // YYYY-MM-DD
  to: string; // YYYY-MM-DD
  preset: DateRangePreset;
};

export const selectedDateRangeState = atom<MarketingDateRange>({
  key: 'selectedDateRangeState',
  default: {
    from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0],
    to: new Date().toISOString().split('T')[0],
    preset: 'last7days',
  },
});

export const selectedPlatformState = atom<string | null>({
  key: 'selectedPlatformState',
  default: null, // null = all platforms
});

export const selectedAccountsState = atom<string[]>({
  key: 'selectedAccountsState',
  default: [],
});

export const selectedCampaignsState = atom<string[]>({
  key: 'selectedCampaignsState',
  default: [],
});
