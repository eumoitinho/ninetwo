import ReactECharts from 'echarts-for-react';
import styled from '@emotion/styled';

type PlatformData = {
  platform: string;
  value: number;
};

type PlatformComparisonChartProps = {
  data: PlatformData[];
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

export const PlatformComparisonChart = ({
  data,
  title,
  height = '300px',
}: PlatformComparisonChartProps) => {
  const platformColors: Record<string, string> = {
    'Google Ads': '#f54bd0',
    'Meta Ads': '#1877f2',
    'Google Analytics': '#e37400',
  };

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
      axisPointer: {
        type: 'shadow',
      },
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
      data: data.map((item) => item.platform),
      axisLine: {
        lineStyle: {
          color: '#e5e7eb',
        },
      },
      axisLabel: {
        color: '#6b7280',
        rotate: 0,
        interval: 0,
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
        type: 'bar',
        data: data.map((item) => ({
          value: item.value,
          itemStyle: {
            color: platformColors[item.platform] || '#f54bd0',
          },
        })),
        barWidth: '60%',
        label: {
          show: true,
          position: 'top',
          color: '#111827',
          fontSize: 12,
          fontWeight: 600,
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
