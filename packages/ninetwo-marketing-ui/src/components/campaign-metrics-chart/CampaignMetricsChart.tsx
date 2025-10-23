import ReactECharts from 'echarts-for-react';
import styled from '@emotion/styled';
import type { CampaignMetrics } from 'ninetwo-marketing-core';

type CampaignMetricsChartProps = {
  data: CampaignMetrics[];
  metricKey: 'clicks' | 'impressions' | 'cost' | 'conversions' | 'roas';
  title?: string;
  height?: string;
};

const StyledChartContainer = styled.div<{ height?: string }>`
  width: 100%;
  height: ${({ height }) => height || '300px'};
  background-color: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
`;

export const CampaignMetricsChart = ({
  data,
  metricKey,
  title,
  height = '300px',
}: CampaignMetricsChartProps) => {
  const xAxisData = data.map((item) => item.date);

  const yAxisData = data.map((item) => {
    if (metricKey === 'cost') {
      return item.cost.amountMicros / 1_000_000;
    }
    if (metricKey === 'roas') {
      const convValue = item.conversionsValue || 0;
      return item.cost.amountMicros > 0
        ? parseFloat((convValue / (item.cost.amountMicros / 1_000_000)).toFixed(2))
        : 0;
    }
    return item[metricKey as keyof CampaignMetrics] as number;
  });

  const option = {
    title: title
      ? {
          text: title,
          left: 'center',
          textStyle: {
            color: '#111827',
            fontSize: 16,
            fontWeight: 600,
          },
        }
      : undefined,
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e5e7eb',
      borderWidth: 1,
      textStyle: {
        color: '#111827',
      },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '10%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: xAxisData,
      axisLine: {
        lineStyle: {
          color: '#e5e7eb',
        },
      },
      axisLabel: {
        color: '#6b7280',
      },
    },
    yAxis: {
      type: 'value',
      axisLine: {
        lineStyle: {
          color: '#e5e7eb',
        },
      },
      axisLabel: {
        color: '#6b7280',
      },
      splitLine: {
        lineStyle: {
          color: '#f3f4f6',
        },
      },
    },
    series: [
      {
        name: metricKey,
        type: 'line',
        smooth: true,
        data: yAxisData,
        lineStyle: {
          color: '#f54bd0',
          width: 3,
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              {
                offset: 0,
                color: 'rgba(245, 75, 208, 0.3)',
              },
              {
                offset: 1,
                color: 'rgba(245, 75, 208, 0.05)',
              },
            ],
          },
        },
        itemStyle: {
          color: '#f54bd0',
        },
      },
    ],
  };

  return (
    <StyledChartContainer height={height}>
      <ReactECharts option={option} style={{ height: '100%', width: '100%' }} />
    </StyledChartContainer>
  );
};
