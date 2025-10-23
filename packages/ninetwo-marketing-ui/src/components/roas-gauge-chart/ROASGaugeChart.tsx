import ReactECharts from 'echarts-for-react';
import styled from '@emotion/styled';

type ROASGaugeChartProps = {
  roasValue: number;
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

export const ROASGaugeChart = ({
  roasValue,
  title = 'ROAS',
  height = '300px',
}: ROASGaugeChartProps) => {
  const getColor = (value: number) => {
    if (value >= 3) return '#10b981';
    if (value >= 1) return '#f59e0b';
    return '#ef4444';
  };

  const option = {
    title: {
      text: title,
      left: 'center',
      top: '10px',
      textStyle: {
        color: '#111827',
        fontSize: 16,
        fontWeight: 600,
      },
    },
    series: [
      {
        type: 'gauge',
        startAngle: 180,
        endAngle: 0,
        min: 0,
        max: 5,
        splitNumber: 5,
        center: ['50%', '70%'],
        radius: '90%',
        axisLine: {
          lineStyle: {
            width: 30,
            color: [
              [0.2, '#ef4444'],
              [0.6, '#f59e0b'],
              [1, '#10b981'],
            ],
          },
        },
        pointer: {
          itemStyle: {
            color: '#111827',
          },
          length: '70%',
          width: 6,
        },
        axisTick: {
          distance: -30,
          length: 8,
          lineStyle: {
            color: '#ffffff',
            width: 2,
          },
        },
        splitLine: {
          distance: -30,
          length: 15,
          lineStyle: {
            color: '#ffffff',
            width: 3,
          },
        },
        axisLabel: {
          distance: 5,
          color: '#6b7280',
          fontSize: 14,
        },
        detail: {
          valueAnimation: true,
          formatter: '{value}',
          color: getColor(roasValue),
          fontSize: 32,
          fontWeight: 'bold',
          offsetCenter: [0, '20%'],
        },
        data: [
          {
            value: roasValue > 5 ? 5 : roasValue,
          },
        ],
      },
    ],
  };

  return (
    <StyledChartContainer height={height}>
      <ReactECharts option={option} style={{ height: '100%', width: '100%' }} />
    </StyledChartContainer>
  );
};
