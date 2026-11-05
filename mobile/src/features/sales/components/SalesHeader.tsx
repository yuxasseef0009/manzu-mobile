import { Banknote, CreditCard, DollarSign, Download, Filter, Receipt, TrendingUp, type LucideIcon } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';

import { Button, Text } from '@/components/ui';
import { formatNairaShort } from '@/lib/format';
import { colors, radius, shadows } from '@/theme';

import type { SalesStats } from '../types';
import type { QuickDate } from '../utils';

function StatCard({ icon: Icon, label, value, color, subtitle }: { icon: LucideIcon; label: string; value: string | number; color: string; subtitle?: string }) {
  return (
    <View style={[styles.stat, shadows.sm]}>
      <View style={[styles.statIcon, { backgroundColor: `${color}20` }]}>
        <Icon size={16} color={color} />
      </View>
      <View style={styles.flex}>
        <Text size="xs" weight="medium" color={colors.gray600}>
          {label}
        </Text>
        <Text size="lg" weight="bold" color={colors.gray900} numberOfLines={1} adjustsFontSizeToFit>
          {value}
        </Text>
        {subtitle ? (
          <Text size="xs" color={colors.gray500} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const QUICK: { type: QuickDate; label: string }[] = [
  { type: 'today', label: 'Today' },
  { type: 'yesterday', label: 'Yesterday' },
  { type: 'week', label: 'Last 7 Days' },
  { type: 'month', label: 'This Month' },
];

interface Props {
  totalSales: number;
  stats: SalesStats | undefined;
  activeQuick: QuickDate | null;
  hasDateFilter: boolean;
  onQuickDate: (type: QuickDate | 'clear') => void;
  onOpenFilters: () => void;
  activeFilterCount: number;
  onExport: () => void;
  exporting: boolean;
  exportDisabled: boolean;
  shownCount: number;
}

const pct = (n: number, total: number) => `${total > 0 ? Math.round((n / total) * 100) : 0}% of total`;

// sales-history/page.jsx header, stat cards and quick date filters.
export function SalesHeader({ totalSales, stats, activeQuick, hasDateFilter, onQuickDate, onOpenFilters, activeFilterCount, onExport, exporting, exportDisabled, shownCount }: Props) {
  const revenue = stats?.totalRevenue ?? 0;
  const cash = stats?.cashSales ?? 0;
  const card = stats?.cardSales ?? 0;
  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        <View style={styles.flex}>
          <Text size="2xl" weight="bold" color={colors.brandBlue}>
            Sales Records
          </Text>
          <Text color={colors.gray600}>Track and analyze your POS sales history</Text>
        </View>
        <Button title="Export" loadingTitle="Exporting..." icon={Download} size="sm" loading={exporting} disabled={exportDisabled} onPress={onExport} style={{ backgroundColor: colors.brandBlue }} />
      </View>

      <View style={styles.grid}>
        <StatCard icon={Receipt} label="Total Sales" value={totalSales} color={colors.brandBlue} subtitle="Transactions" />
        <StatCard icon={DollarSign} label="Total Revenue" value={formatNairaShort(revenue)} color={colors.primary} />
        <StatCard icon={TrendingUp} label="Avg Transaction" value={formatNairaShort(Math.round(totalSales > 0 ? revenue / totalSales : 0))} color={colors.brandPurple} />
        <StatCard icon={Banknote} label="Cash Sales" value={cash} color={colors.success} subtitle={pct(cash, totalSales)} />
        <StatCard icon={CreditCard} label="Card Sales" value={card} color={colors.info} subtitle={pct(card, totalSales)} />
      </View>

      <View style={styles.chips}>
        {QUICK.map((q) => {
          const active = activeQuick === q.type;
          return (
            <Pressable
              key={q.type}
              onPress={() => onQuickDate(q.type)}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              style={[styles.chip, { backgroundColor: active ? colors.primary : colors.gray100 }]}
            >
              <Text size="xs" weight="medium" color={active ? colors.white : colors.gray700}>
                {q.label}
              </Text>
            </Pressable>
          );
        })}
        {hasDateFilter ? (
          <Pressable onPress={() => onQuickDate('clear')} accessibilityRole="button" style={[styles.chip, { backgroundColor: colors.red100 }]}>
            <Text size="xs" weight="medium" color={colors.red700}>
              Clear Dates
            </Text>
          </Pressable>
        ) : null}
      </View>

      <View style={styles.listHeader}>
        <View style={styles.flex}>
          <Text size="lg" weight="semibold" color={colors.gray900}>
            Sales History
          </Text>
          <Text size="xs" color={colors.gray600}>
            Showing {shownCount} of {totalSales} transaction{totalSales !== 1 ? 's' : ''}
          </Text>
        </View>
        <Pressable onPress={onOpenFilters} accessibilityRole="button" accessibilityLabel="Sales filters" style={[styles.filterButton, activeFilterCount > 0 && styles.filterButtonActive]}>
          <Filter size={18} color={activeFilterCount > 0 ? colors.white : colors.brandBlue} />
          <Text size="xs" weight="semibold" color={activeFilterCount > 0 ? colors.white : colors.brandBlue}>
            {activeFilterCount > 0 ? `Filters (${activeFilterCount})` : 'Filters'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  container: { gap: 12, paddingBottom: 4 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  stat: { flexBasis: '48%', flexGrow: 1, flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, backgroundColor: colors.white, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.gray200 },
  statIcon: { padding: 8, borderRadius: radius.lg },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 12, minHeight: 36, justifyContent: 'center', borderRadius: radius.lg },
  listHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingTop: 4 },
  filterButton: { flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 44, paddingHorizontal: 12, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.gray300, backgroundColor: colors.white },
  filterButtonActive: { backgroundColor: colors.brandBlue, borderColor: colors.brandBlue },
});
