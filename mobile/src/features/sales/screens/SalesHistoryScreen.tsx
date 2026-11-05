import { Receipt } from 'lucide-react-native';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, View } from 'react-native';
import Toast from 'react-native-toast-message';

import { errorMessage } from '@/api/errors';
import { EmptyState, ErrorState, Screen, Skeleton, Text } from '@/components/ui';
import { useIsOnline } from '@/lib/network';
import { colors, radius } from '@/theme';

import { SaleCard } from '../components/SaleCard';
import { SaleDetailSheet } from '../components/SaleDetailSheet';
import { SalesFilterSheet } from '../components/SalesFilterSheet';
import { SalesHeader } from '../components/SalesHeader';
import { useExportSales, useSales } from '../hooks';
import type { Sale, SalesFilters } from '../types';
import { activeQuickDate, EMPTY_SALES_FILTERS, quickDateFilters, type QuickDate } from '../utils';

// pos/sales-history/page.jsx. Infinite scroll replaces Previous/Next; the detail sheet uses the list row.
export function SalesHistoryScreen() {
  const online = useIsOnline();
  const [filters, setFilters] = useState<SalesFilters>(EMPTY_SALES_FILTERS);
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [selected, setSelected] = useState<Sale | null>(null);
  const query = useSales(filters);
  const exportSales = useExportSales();

  const sales = useMemo(() => query.data?.pages.flatMap((p) => p.sales) ?? [], [query.data]);
  const firstPage = query.data?.pages[0];
  const totalSales = firstPage?.pagination.total ?? 0;

  const onQuickDate = useCallback((type: QuickDate | 'clear') => setFilters((f) => ({ ...f, ...quickDateFilters(type) })), []);
  const onOpen = useCallback((sale: Sale) => setSelected(sale), []);

  const hasDateFilter = !!(filters.date || filters.startDate || filters.endDate);
  const activeFilterCount = (hasDateFilter ? 1 : 0) + (filters.paymentMethod ? 1 : 0) + (filters.minAmount || filters.maxAmount ? 1 : 0);

  const onExport = () =>
    exportSales.mutate(filters, {
      onError: (err) => Toast.show({ type: 'error', text1: 'Failed to export sales data', text2: errorMessage(err) }),
    });

  const listEmpty = query.isPending ? (
    <View style={styles.skeletons}>
      {[0, 1, 2].map((i) => (
        <Skeleton key={i} height={130} style={styles.skeleton} />
      ))}
    </View>
  ) : query.isError ? (
    <ErrorState error={query.error} title="Failed to load sales records." onRetry={() => void query.refetch()} />
  ) : (
    <EmptyState icon={Receipt} title="No sales found" description="No sales match your current filters" />
  );

  return (
    <Screen scroll={false} edges={['bottom']} dataUpdatedAt={query.dataUpdatedAt || undefined} contentStyle={styles.screen}>
      <FlatList
        data={sales}
        keyExtractor={(s) => String(s.id)}
        renderItem={({ item }) => <SaleCard sale={item} onOpen={onOpen} />}
        ListHeaderComponent={
          <SalesHeader
            totalSales={totalSales}
            stats={firstPage?.stats}
            activeQuick={activeQuickDate(filters)}
            hasDateFilter={hasDateFilter}
            onQuickDate={onQuickDate}
            onOpenFilters={() => setFilterSheetOpen(true)}
            activeFilterCount={activeFilterCount}
            onExport={onExport}
            exporting={exportSales.isPending}
            exportDisabled={!online || sales.length === 0}
            shownCount={sales.length}
          />
        }
        ListEmptyComponent={listEmpty}
        ListFooterComponent={
          sales.length > 0 ? (
            <View style={styles.footer}>
              {query.isFetchingNextPage ? (
                <ActivityIndicator color={colors.primary} />
              ) : (
                <Text size="xs" color={colors.gray500}>
                  {query.hasNextPage ? 'Scroll for more' : `${totalSales} total`}
                </Text>
              )}
            </View>
          ) : undefined
        }
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={Separator}
        onEndReached={() => {
          if (query.hasNextPage && !query.isFetchingNextPage) void query.fetchNextPage();
        }}
        onEndReachedThreshold={0.5}
        refreshing={query.isRefetching && !query.isFetchingNextPage}
        onRefresh={() => void query.refetch()}
      />
      <SalesFilterSheet visible={filterSheetOpen} filters={filters} onApply={setFilters} onClose={() => setFilterSheetOpen(false)} />
      <SaleDetailSheet sale={selected} onClose={() => setSelected(null)} />
    </Screen>
  );
}

function Separator() {
  return <View style={styles.separator} />;
}

const styles = StyleSheet.create({
  screen: { padding: 0, gap: 0 },
  list: { padding: 16, flexGrow: 1 },
  separator: { height: 8 },
  skeletons: { gap: 8 },
  skeleton: { borderRadius: radius.lg },
  footer: { alignItems: 'center', paddingVertical: 16 },
});
