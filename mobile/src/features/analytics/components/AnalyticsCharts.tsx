import type { LucideIcon } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { BarChart, LineChart, PieChart } from 'react-native-gifted-charts';

import { Card, Text } from '@/components/ui';
import { titleCase } from '@/features/orders/constants';
import { colors, fonts, radius } from '@/theme';

import type { DailyRevenue, OrderAnalytics, TopMedication } from '../types';
import { compactNaira, STATUS_CHART_COLORS } from '../utils';

const CHART_HEIGHT = 200;
const Y_AXIS_WIDTH = 48;
const axisText = { fontFamily: fonts.regular, fontSize: 10, color: colors.gray500 };

export function ChartCard({ title, icon: Icon, children }: { title: string; icon: LucideIcon; children: ReactNode }) {
  return (
    <Card style={styles.card}>
      <View style={styles.title}>
        <Icon size={16} color={colors.brandBlue} />
        <Text size="base" weight="semibold" color={colors.gray900}>
          {title}
        </Text>
      </View>
      {children}
    </Card>
  );
}

function NoData() {
  return (
    <View style={styles.empty}>
      <Text color={colors.gray500}>No data for this period</Text>
    </View>
  );
}

/** Inner plot width: screen padding (16×2) + card padding (16×2) + y-axis labels. */
function usePlotWidth() {
  const { width } = useWindowDimensions();
  return Math.max(200, Math.min(width, 720) - 64 - Y_AXIS_WIDTH);
}

export function RevenueTrendChart({ data }: { data: DailyRevenue[] }) {
  const plotWidth = usePlotWidth();
  if (data.length === 0) return <NoData />;
  const spacing = data.length > 1 ? Math.max(24, (plotWidth - 24) / (data.length - 1)) : plotWidth / 2;
  const labelEvery = Math.max(1, Math.ceil(data.length / 5));
  return (
    <LineChart
      data={data.map((d, i) => ({ value: d.revenue, label: i % labelEvery === 0 ? d.label : '' }))}
      areaChart
      curved
      color={colors.primary}
      thickness={2}
      startFillColor={colors.primary}
      endFillColor={colors.primary}
      startOpacity={0.2}
      endOpacity={0.02}
      dataPointsColor={colors.primary}
      hideDataPoints={data.length > 31}
      height={CHART_HEIGHT}
      width={plotWidth}
      spacing={spacing}
      initialSpacing={12}
      endSpacing={12}
      noOfSections={4}
      yAxisLabelWidth={Y_AXIS_WIDTH}
      formatYLabel={(label) => compactNaira(Number(label))}
      yAxisTextStyle={axisText}
      xAxisLabelTextStyle={[axisText, styles.xLabel]}
      rulesColor={colors.gray100}
      xAxisColor={colors.gray200}
      yAxisColor={colors.gray200}
      disableScroll={spacing * (data.length - 1) <= plotWidth}
    />
  );
}

export function StatusDonut({ data }: { data: OrderAnalytics['statusCounts'] }) {
  if (data.length === 0) return <NoData />;
  const total = data.reduce((s, d) => s + d.count, 0);
  const color = (i: number) => STATUS_CHART_COLORS[i] ?? colors.gray400;
  return (
    <View style={styles.donutRow}>
      <PieChart
        donut
        radius={80}
        innerRadius={52}
        data={data.map((d, i) => ({ value: d.count, color: color(i) }))}
        centerLabelComponent={() => (
          <View style={styles.center}>
            <Text size="xl" weight="bold" color={colors.gray900}>
              {total}
            </Text>
            <Text size="xs" color={colors.gray500}>
              orders
            </Text>
          </View>
        )}
      />
      <View style={styles.legend}>
        {data.map((d, i) => (
          <View key={d.status} style={styles.legendRow}>
            <View style={[styles.swatch, { backgroundColor: color(i) }]} />
            <Text size="xs" color={colors.gray700} style={styles.flex} numberOfLines={1}>
              {titleCase(d.status)}
            </Text>
            <Text size="xs" weight="semibold" color={colors.gray900}>
              {d.count}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

export function TopMedsChart({ data }: { data: TopMedication[] }) {
  const plotWidth = usePlotWidth();
  if (data.length === 0) return <NoData />;
  const barWidth = Math.min(40, (plotWidth - 24) / data.length - 16);
  return (
    <BarChart
      data={data.map((m) => ({ value: m.count, label: m.name.length > 9 ? `${m.name.slice(0, 8)}…` : m.name }))}
      frontColor={colors.brandBlue}
      barWidth={barWidth}
      spacing={16}
      initialSpacing={12}
      barBorderRadius={4}
      height={CHART_HEIGHT}
      width={plotWidth}
      noOfSections={4}
      yAxisLabelWidth={Y_AXIS_WIDTH}
      yAxisTextStyle={axisText}
      xAxisLabelTextStyle={[axisText, styles.xLabel]}
      labelWidth={barWidth + 16}
      rulesColor={colors.gray100}
      xAxisColor={colors.gray200}
      yAxisColor={colors.gray200}
      showValuesAsTopLabel
      topLabelTextStyle={axisText}
      disableScroll
    />
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  card: { padding: 16, gap: 12, overflow: 'hidden' },
  title: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  empty: { height: 120, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.gray50, borderRadius: radius.lg },
  xLabel: { width: 56 },
  donutRow: { flexDirection: 'row', alignItems: 'center', gap: 16, flexWrap: 'wrap', justifyContent: 'center' },
  center: { alignItems: 'center' },
  legend: { flex: 1, minWidth: 120, gap: 8 },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  swatch: { width: 10, height: 10, borderRadius: 5 },
});
