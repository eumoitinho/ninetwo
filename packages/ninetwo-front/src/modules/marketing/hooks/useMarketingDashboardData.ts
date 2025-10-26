import { useMemo } from 'react';

import { type AdsCampaign } from '@/marketing/types/AdsCampaign';
import { type AnalyticsData } from '@/marketing/types/AnalyticsData';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';

export type AggregatedAdsMetrics = {
  totalImpressions: number;
  totalClicks: number;
  totalCost: number;
  totalConversions: number;
  totalConversionValue: number;
  averageCPC: number;
  averageCPA: number;
  roas: number;
  ctr: number;
};

export type AggregatedAnalyticsMetrics = {
  totalSessions: number;
  totalUsers: number;
  newUsers: number;
  totalPageViews: number;
  totalConversions: number;
  totalRevenue: number;
  averageBounceRate: number;
  averageEngagementRate: number;
};

export const useMarketingDashboardData = (dateRange?: {
  startDate: string;
  endDate: string;
}) => {
  const { records: adsCampaigns, loading: loadingAds } =
    useFindManyRecords<AdsCampaign>({
      objectNameSingular: CoreObjectNameSingular.AdsCampaign,
      filter: dateRange
        ? {
            lastSyncedAt: {
              gte: dateRange.startDate,
              lte: dateRange.endDate,
            },
          }
        : {},
    });

  const { records: analyticsData, loading: loadingAnalytics } =
    useFindManyRecords<AnalyticsData>({
      objectNameSingular: CoreObjectNameSingular.AnalyticsData,
      filter: dateRange
        ? {
            date: {
              gte: dateRange.startDate,
              lte: dateRange.endDate,
            },
          }
        : {},
      orderBy: [{ date: 'DescNullsLast' }],
    });

  const adsMetrics = useMemo<AggregatedAdsMetrics>(() => {
    const totalImpressions = adsCampaigns.reduce(
      (sum, c) => sum + (c.impressions || 0),
      0,
    );
    const totalClicks = adsCampaigns.reduce(
      (sum, c) => sum + (c.clicks || 0),
      0,
    );
    const totalCost = adsCampaigns.reduce(
      (sum, c) => sum + (c.costMicros || 0),
      0,
    );
    const totalConversions = adsCampaigns.reduce(
      (sum, c) => sum + (c.conversions || 0),
      0,
    );
    const totalConversionValue = adsCampaigns.reduce(
      (sum, c) => sum + (c.conversionValue || 0),
      0,
    );

    const averageCPC = totalClicks > 0 ? totalCost / totalClicks : 0;
    const averageCPA = totalConversions > 0 ? totalCost / totalConversions : 0;
    const roas = totalCost > 0 ? totalConversionValue / totalCost : 0;
    const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;

    return {
      totalImpressions,
      totalClicks,
      totalCost,
      totalConversions,
      totalConversionValue,
      averageCPC,
      averageCPA,
      roas,
      ctr,
    };
  }, [adsCampaigns]);

  const analyticsMetrics = useMemo<AggregatedAnalyticsMetrics>(() => {
    const totalSessions = analyticsData.reduce(
      (sum, d) => sum + (d.sessions || 0),
      0,
    );
    const totalUsers = analyticsData.reduce(
      (sum, d) => sum + (d.totalUsers || 0),
      0,
    );
    const newUsers = analyticsData.reduce(
      (sum, d) => sum + (d.newUsers || 0),
      0,
    );
    const totalPageViews = analyticsData.reduce(
      (sum, d) => sum + (d.screenPageViews || 0),
      0,
    );
    const totalConversions = analyticsData.reduce(
      (sum, d) => sum + (d.conversions || 0),
      0,
    );
    const totalRevenue = analyticsData.reduce(
      (sum, d) => sum + (d.totalRevenue || 0),
      0,
    );

    const totalBounceRate = analyticsData.reduce(
      (sum, d) => sum + (d.bounceRate || 0),
      0,
    );
    const averageBounceRate =
      analyticsData.length > 0 ? totalBounceRate / analyticsData.length : 0;

    const totalEngagementRate = analyticsData.reduce(
      (sum, d) => sum + (d.engagementRate || 0),
      0,
    );
    const averageEngagementRate =
      analyticsData.length > 0
        ? totalEngagementRate / analyticsData.length
        : 0;

    return {
      totalSessions,
      totalUsers,
      newUsers,
      totalPageViews,
      totalConversions,
      totalRevenue,
      averageBounceRate,
      averageEngagementRate,
    };
  }, [analyticsData]);

  return {
    adsCampaigns,
    analyticsData,
    adsMetrics,
    analyticsMetrics,
    loading: loadingAds || loadingAnalytics,
  };
};


