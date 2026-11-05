import { Calendar, CheckSquare, Clock, DollarSign, Filter, Package, Search, ShoppingCart, TrendingUp, X, type LucideIcon } from 'lucide-react-native';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { Text } from '@/components/ui';
import { formatNairaShort } from '@/lib/format';
import { colors, fonts, radius, shadows } from '@/theme';

import { utcDate } from '../constants';
import type { OrderFilters, OrderStatusFilter } from '../types';

export interface OrderStats {
  totalOrders: number;
  pendingOrders: number;
  processingOrders: number;
  completedOrders: number;
  totalRevenue: number;
  avgOrderValue: number;
}

type StatKey = 'all' | 'pending' | 'processing' | 'completed';
const STAT_STATUS: Record<Exclude<StatKey, 'all'>, OrderStatusFilter> = { pending: 'CONFIRMED', processing: 'PROCESSING', completed: 'COMPLETED' };

export function activeStatFor(status: OrderFilters['status']): StatKey | null {
  if (!status) return 'all';
  const match = (Object.keys(STAT_STATUS) as Exclude<StatKey, 'all'>[]).find((k) => STAT_STATUS[k] === status);
  return match ?? null;
}

function StatCard({ icon: Icon, label, value, color, subtitle, active, onPress }: { icon: LucideIcon; label: string; value: number; color: string; subtitle: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      style={[styles.stat, shadows.sm, active && { borderColor: color, borderWidth: 2 }]}
    >
      <View style={[styles.statIcon, { backgroundColor: active ? `${color}30` : `${color}20` }]}>
        <Icon size={16} color={color} />
      </View>
      <View style={styles.flex}>
        <Text size="xs" weight="medium" color={colors.gray600}>
          {label}
        </Text>
        <Text size="lg" weight="bold" color={colors.gray900}>
          {value}
        </Text>
        <Text size="xs" color={colors.gray500} numberOfLines={1}>
          {subtitle}
        </Text>
      </View>
      {active ? <View style={[styles.activeDot, { backgroundColor: color }]} /> : null}
    </Pressable>
  );
}

function Chip({ label, icon: Icon, active, activeColors, onPress }: { label: string; icon?: LucideIcon; active?: boolean; activeColors?: { bg: string; fg: string; border?: string }; onPress: () => void }) {
  const bg = active ? (activeColors?.bg ?? colors.primary) : colors.gray100;
  const fg = active ? (activeColors?.fg ?? colors.white) : colors.gray700;
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityState={{ selected: !!active }} style={[styles.chip, { backgroundColor: bg, borderColor: active ? (activeColors?.border ?? bg) : bg }]}>
      {Icon ? <Icon size={14} color={fg} /> : null}
      <Text size="xs" weight="medium" color={fg}>
        {label}
      </Text>
    </Pressable>
  );
}

interface OrdersHeaderProps {
  stats: OrderStats;
  filters: OrderFilters;
  searchText: string;
  onSearchText: (text: string) => void;
  onChange: (patch: Partial<OrderFilters>) => void;
  onOpenFilters: () => void;
  activeFilterCount: number;
}

// orders/page.jsx header, stat cards, revenue cards and Quick Filters.
export function OrdersHeader({ stats, filters, searchText, onSearchText, onChange, onOpenFilters, activeFilterCount }: OrdersHeaderProps) {
  const activeStat = activeStatFor(filters.status);
  const onStat = (key: StatKey) => {
    if (activeStat === key || key === 'all') return onChange({ status: '' });
    onChange({ status: STAT_STATUS[key] });
  };
  const today = utcDate(0);

  return (
    <View style={styles.container}>
      <View>
        <Text size="2xl" weight="bold" color={colors.brandBlue}>
          Orders Management
        </Text>
        <Text color={colors.gray600}>Process and track online orders from customers</Text>
      </View>

      <View style={styles.statGrid}>
        <StatCard icon={ShoppingCart} label="Total Orders" value={stats.totalOrders} color={colors.brandBlue} subtitle="All time" active={activeStat === 'all'} onPress={() => onStat('all')} />
        <StatCard icon={Clock} label="Pending" value={stats.pendingOrders} color={colors.brandOrange} subtitle="Needs attention" active={activeStat === 'pending'} onPress={() => onStat('pending')} />
        <StatCard icon={Package} label="Processing" value={stats.processingOrders} color={colors.info} subtitle="In progress" active={activeStat === 'processing'} onPress={() => onStat('processing')} />
        <StatCard icon={CheckSquare} label="Completed" value={stats.completedOrders} color={colors.primary} subtitle="Orders fulfilled" active={activeStat === 'completed'} onPress={() => onStat('completed')} />
      </View>

      <View style={[styles.revenue, { backgroundColor: colors.green50, borderColor: colors.green200 }]}>
        <View style={[styles.revenueIcon, shadows.sm]}>
          <DollarSign size={24} color={colors.green600} />
        </View>
        <View>
          <Text size="xs" weight="medium" color={colors.gray600}>
            Total Revenue
          </Text>
          <Text size="xl" weight="bold" color={colors.gray900}>
            {formatNairaShort(stats.totalRevenue)}
          </Text>
        </View>
      </View>
      <View style={[styles.revenue, { backgroundColor: colors.purple50, borderColor: colors.purple200 }]}>
        <View style={[styles.revenueIcon, shadows.sm]}>
          <TrendingUp size={24} color={colors.purple600} />
        </View>
        <View>
          <Text size="xs" weight="medium" color={colors.gray600}>
            Avg Order Value
          </Text>
          <Text size="xl" weight="bold" color={colors.gray900}>
            {formatNairaShort(Math.round(stats.avgOrderValue))}
          </Text>
        </View>
      </View>

      <View style={[styles.filtersCard, shadows.sm]}>
        <View style={styles.filtersTitle}>
          <Filter size={16} color={colors.brandBlue} />
          <Text weight="semibold" color={colors.gray900}>
            Quick Filters
          </Text>
        </View>
        <View style={styles.chips}>
          <Chip label="Today" icon={Calendar} active={filters.date === today} onPress={() => onChange({ date: today })} />
          <Chip label="Yesterday" onPress={() => onChange({ date: utcDate(-1) })} />
          <Chip label="Pending" icon={Clock} active={filters.status === 'CONFIRMED'} activeColors={{ bg: colors.yellow100, fg: colors.yellow800, border: colors.yellow300 }} onPress={() => onChange({ status: 'CONFIRMED' })} />
          <Chip label="Processing" icon={Package} active={filters.status === 'PROCESSING'} activeColors={{ bg: colors.blue100, fg: colors.blue800, border: colors.blue300 }} onPress={() => onChange({ status: 'PROCESSING' })} />
          <Pressable onPress={() => onChange({ date: '', status: '', deliveryMethod: '' })} accessibilityRole="button" style={[styles.chip, { backgroundColor: colors.red100, borderColor: colors.red100 }]}>
            <Text size="xs" weight="medium" color={colors.red700}>
              Clear
            </Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.searchRow}>
        <View style={styles.search}>
          <Search size={16} color={colors.gray400} />
          <TextInput
            value={searchText}
            onChangeText={onSearchText}
            placeholder="Search by customer name, order number..."
            placeholderTextColor={colors.gray400}
            style={styles.searchInput}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
            accessibilityLabel="Search orders"
          />
          {searchText ? (
            <Pressable onPress={() => onSearchText('')} hitSlop={10} accessibilityRole="button" accessibilityLabel="Clear search">
              <X size={16} color={colors.gray400} />
            </Pressable>
          ) : null}
        </View>
        <Pressable onPress={onOpenFilters} accessibilityRole="button" accessibilityLabel="Status and delivery filters" style={[styles.filterButton, activeFilterCount > 0 && styles.filterButtonActive]}>
          <Filter size={18} color={activeFilterCount > 0 ? colors.white : colors.brandBlue} />
          {activeFilterCount > 0 ? (
            <Text size="xs" weight="bold" color={colors.white}>
              {activeFilterCount}
            </Text>
          ) : null}
        </Pressable>
      </View>
      {filters.date ? (
        <Text size="xs" color={colors.gray500}>
          Showing orders from {filters.date} (UTC)
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  container: { gap: 12, paddingBottom: 4 },
  statGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  stat: { flexBasis: '48%', flexGrow: 1, flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, backgroundColor: colors.white, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.gray200 },
  statIcon: { padding: 8, borderRadius: radius.lg },
  activeDot: { width: 8, height: 8, borderRadius: 4 },
  revenue: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderRadius: radius.lg, borderWidth: 2 },
  revenueIcon: { padding: 8, borderRadius: radius.lg, backgroundColor: colors.white },
  filtersCard: { backgroundColor: colors.white, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.gray200, padding: 16, gap: 12 },
  filtersTitle: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, minHeight: 36, borderRadius: radius.lg, borderWidth: 1 },
  searchRow: { flexDirection: 'row', gap: 8 },
  search: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, minHeight: 44, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.gray300, borderRadius: radius.lg },
  searchInput: { flex: 1, fontFamily: fonts.regular, fontSize: 14, color: colors.gray900, paddingVertical: 8 },
  filterButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, minWidth: 44, minHeight: 44, paddingHorizontal: 10, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.gray300, backgroundColor: colors.white },
  filterButtonActive: { backgroundColor: colors.brandBlue, borderColor: colors.brandBlue },
});
