import { AlertCircle, AlertTriangle, CheckCircle, DollarSign, Filter, Package, Search, X, type LucideIcon } from 'lucide-react-native';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { Text } from '@/components/ui';
import { formatNairaShort } from '@/lib/format';
import { colors, fonts, radius, shadows } from '@/theme';

import type { CatalogSummary, InventoryFilters, StockFilter } from '../types';

function StatCard({ icon: Icon, label, value, color, active, onPress }: { icon: LucideIcon; label: string; value: string | number; color: string; active?: boolean; onPress?: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityState={onPress ? { selected: !!active } : undefined}
      style={[styles.stat, shadows.sm, { borderColor: active ? color : colors.gray200, borderWidth: active ? 2 : 1 }]}
    >
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
      </View>
    </Pressable>
  );
}

interface InventoryHeaderProps {
  summary: CatalogSummary | undefined;
  filters: InventoryFilters;
  searchText: string;
  onSearchText: (text: string) => void;
  onStockFilter: (stock: StockFilter) => void;
  onOpenFilters: () => void;
  activeFilterCount: number;
}

// inventory/page.jsx header, stat cards, stock value, clear filter and expiring alert.
export function InventoryHeader({ summary, filters, searchText, onSearchText, onStockFilter, onOpenFilters, activeFilterCount }: InventoryHeaderProps) {
  const expiring = summary?.expiringSoonCount ?? 0;
  return (
    <View style={styles.container}>
      <View>
        <Text size="2xl" weight="bold" color={colors.brandBlue}>
          Inventory Management
        </Text>
        <Text color={colors.gray600}>Manage your medications catalog</Text>
      </View>

      <View style={styles.grid}>
        <StatCard icon={CheckCircle} label="In Stock" value={summary?.stockedCount || 0} color="#1ABA7F" active={filters.stock === 'stocked'} onPress={() => onStockFilter('stocked')} />
        <StatCard icon={AlertCircle} label="Low Stock" value={summary?.lowStockCount || 0} color="#F59E0B" active={filters.stock === 'low'} onPress={() => onStockFilter('low')} />
        <StatCard icon={AlertTriangle} label="Out of Stock" value={summary?.outOfStockCount || 0} color="#EF4444" active={filters.stock === 'out'} onPress={() => onStockFilter('out')} />
        <StatCard icon={Package} label="Not Stocked" value={summary?.notStockedCount || 0} color="#6B7280" active={filters.stock === 'not_stocked'} onPress={() => onStockFilter('not_stocked')} />
      </View>
      <StatCard icon={DollarSign} label="Stock Value" value={formatNairaShort(summary?.totalValue)} color="#10B981" />

      {filters.stock !== 'stocked' ? (
        <Pressable onPress={() => onStockFilter('stocked')} accessibilityRole="button" hitSlop={8} style={styles.clear}>
          <Text color={colors.blue600}>Clear filter</Text>
        </Pressable>
      ) : null}

      {expiring > 0 ? (
        <View style={styles.alert}>
          <AlertTriangle size={20} color={colors.orange600} />
          <View style={styles.flex}>
            <Text weight="semibold" color="#7C2D12">
              {expiring} medication{expiring !== 1 ? 's' : ''} expiring within 30 days
            </Text>
            <Text size="xs" color="#C2410C">
              Review and process these items soon to avoid wastage
            </Text>
          </View>
          <Pressable onPress={() => onStockFilter('expiring')} accessibilityRole="button" style={styles.alertButton}>
            <Text size="xs" weight="semibold" color={colors.white}>
              View
            </Text>
          </Pressable>
        </View>
      ) : null}

      <View style={styles.searchRow}>
        <View style={styles.search}>
          <Search size={16} color={colors.gray400} />
          <TextInput
            value={searchText}
            onChangeText={onSearchText}
            placeholder="Search by medication name..."
            placeholderTextColor={colors.gray400}
            style={styles.searchInput}
            autoCorrect={false}
            returnKeyType="search"
            accessibilityLabel="Search medications"
          />
          {searchText ? (
            <Pressable onPress={() => onSearchText('')} hitSlop={10} accessibilityRole="button" accessibilityLabel="Clear search">
              <X size={16} color={colors.gray400} />
            </Pressable>
          ) : null}
        </View>
        <Pressable onPress={onOpenFilters} accessibilityRole="button" accessibilityLabel="Stock and type filters" style={[styles.filterButton, activeFilterCount > 0 && styles.filterButtonActive]}>
          <Filter size={18} color={activeFilterCount > 0 ? colors.white : colors.brandBlue} />
          {activeFilterCount > 0 ? (
            <Text size="xs" weight="bold" color={colors.white}>
              {activeFilterCount}
            </Text>
          ) : null}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  container: { gap: 12, paddingBottom: 4 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  stat: { flexBasis: '48%', flexGrow: 1, flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, backgroundColor: colors.white, borderRadius: radius.lg },
  statIcon: { padding: 8, borderRadius: radius.lg },
  clear: { alignSelf: 'flex-start' },
  alert: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderRadius: radius.lg, borderWidth: 2, borderColor: '#FDBA74', backgroundColor: colors.orange50 },
  alertButton: { paddingHorizontal: 12, minHeight: 36, justifyContent: 'center', borderRadius: radius.lg, backgroundColor: colors.orange600 },
  searchRow: { flexDirection: 'row', gap: 8 },
  search: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, minHeight: 44, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.gray300, borderRadius: radius.lg },
  searchInput: { flex: 1, fontFamily: fonts.regular, fontSize: 14, color: colors.gray900, paddingVertical: 8 },
  filterButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, minWidth: 44, minHeight: 44, paddingHorizontal: 10, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.gray300, backgroundColor: colors.white },
  filterButtonActive: { backgroundColor: colors.brandBlue, borderColor: colors.brandBlue },
});
