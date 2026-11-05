import { Package, Star, TrendingUp, Users, type LucideIcon } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { Text } from '@/components/ui';
import { formatNairaShort } from '@/lib/format';
import { colors, gradients, radius, shadows } from '@/theme';

import type { InventoryHealth, TopMedication } from '../types';
import { ChartCard } from './AnalyticsCharts';

export function StatTile({ icon: Icon, label, value, color }: { icon: LucideIcon; label: string; value: string | number; color: string }) {
  return (
    <View style={[styles.stat, shadows.sm]}>
      <View style={[styles.statIcon, { backgroundColor: `${color}20` }]}>
        <Icon size={20} color={color} />
      </View>
      <Text size="2xl" weight="bold" color={colors.gray900} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
      <Text size="xs" weight="medium" color={colors.gray600}>
        {label}
      </Text>
    </View>
  );
}

function InsightRow({ label, value, icon: Icon, bg, border, iconColor }: { label: string; value: string | number; icon: LucideIcon; bg: string; border: string; iconColor: string }) {
  return (
    <View style={[styles.insight, { backgroundColor: bg, borderColor: border }]}>
      <View style={styles.flex}>
        <Text size="xs" weight="medium" color={colors.gray600}>
          {label}
        </Text>
        <Text size="2xl" weight="bold" color={colors.gray900}>
          {value}
        </Text>
      </View>
      <Icon size={36} color={iconColor} />
    </View>
  );
}

export function CustomerInsightsCard({ unique, returning, retention }: { unique: number; returning: number; retention: number }) {
  return (
    <ChartCard title="Customer Insights" icon={Users}>
      <InsightRow label="Total Customers" value={unique} icon={Users} bg={colors.blue50} border={colors.blue200} iconColor={colors.blue600} />
      <InsightRow label="Returning Customers" value={returning} icon={Star} bg={colors.purple50} border={colors.purple200} iconColor={colors.purple600} />
      <InsightRow label="Retention Rate" value={`${retention}%`} icon={TrendingUp} bg={colors.orange50} border={colors.orange200} iconColor={colors.orange600} />
    </ChartCard>
  );
}

function HealthTile({ label, value, bg, border, fg }: { label: string; value: string | number; bg: string; border: string; fg: string }) {
  return (
    <View style={[styles.health, { backgroundColor: bg, borderColor: border }]}>
      <Text size="xs" weight="medium" color={colors.gray600}>
        {label}
      </Text>
      <Text size="xl" weight="bold" color={fg} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
    </View>
  );
}

export function InventoryHealthCard({ health }: { health: InventoryHealth }) {
  return (
    <ChartCard title="Inventory Health" icon={Package}>
      <View style={styles.healthGrid}>
        <HealthTile label="Total Items" value={health.totalItems} bg={colors.blue50} border={colors.blue200} fg={colors.blue600} />
        <HealthTile label="Low Stock" value={health.lowStock} bg={colors.yellow50} border={colors.yellow300} fg={colors.yellow600} />
        <HealthTile label="Out of Stock" value={health.outOfStock} bg={colors.red50} border={colors.red200} fg={colors.red600} />
        <HealthTile label="Total Value" value={formatNairaShort(Math.round(health.totalValue))} bg={colors.green50} border={colors.green200} fg={colors.green600} />
      </View>
    </ChartCard>
  );
}

export function TopMedicationsTable({ medications }: { medications: TopMedication[] }) {
  return (
    <ChartCard title="Top Performing Medications" icon={Star}>
      {medications.length === 0 ? (
        <Text color={colors.gray500}>No medication sales in this period</Text>
      ) : (
        medications.map((m, i) => (
          <View key={m.name} style={[styles.medRow, i > 0 && styles.divider]}>
            <LinearGradient colors={gradients.brandText} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.rank}>
              <Text size="xs" weight="bold" color={colors.white}>
                {i + 1}
              </Text>
            </LinearGradient>
            <View style={styles.flex}>
              <Text weight="medium" color={colors.gray900} numberOfLines={1}>
                {m.name}
              </Text>
              <Text size="xs" color={colors.gray600}>
                {m.count} unit{m.count !== 1 ? 's' : ''} sold
              </Text>
            </View>
            <Text weight="semibold" color={colors.green600}>
              {formatNairaShort(Math.round(m.revenue))}
            </Text>
          </View>
        ))
      )}
    </ChartCard>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  stat: { flexBasis: '47%', flexGrow: 1, padding: 16, gap: 4, backgroundColor: colors.white, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.gray200 },
  statIcon: { alignSelf: 'flex-start', padding: 8, borderRadius: radius.lg, marginBottom: 8 },
  insight: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: radius.lg, borderWidth: 2 },
  healthGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  health: { flexBasis: '46%', flexGrow: 1, padding: 12, borderRadius: radius.lg, borderWidth: 2, gap: 2 },
  medRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  divider: { borderTopWidth: 1, borderTopColor: colors.gray100 },
  rank: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
});
