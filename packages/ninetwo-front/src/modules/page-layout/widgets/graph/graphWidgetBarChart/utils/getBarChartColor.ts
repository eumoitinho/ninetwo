import { type BarChartConfig } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartConfig';
import { type BarDatum, type ComputedDatum } from '@nivo/bar';
import { isDefined } from 'ninetwo-shared/utils';
import { type ThemeType } from 'ninetwo-ui/theme';

export const getBarChartColor = (
  datum: ComputedDatum<BarDatum>,
  barConfigs: BarChartConfig[],
  theme: ThemeType,
) => {
  const bar = barConfigs.find(
    (b) => b.key === datum.id && b.indexValue === datum.indexValue,
  );
  if (!isDefined(bar)) {
    return theme.border.color.light;
  }
  return `url(#${bar.gradientId})`;
};
