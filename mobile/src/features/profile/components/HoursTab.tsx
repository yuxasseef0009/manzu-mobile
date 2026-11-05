import { Clock, Pencil } from 'lucide-react-native';
import { useState } from 'react';
import { StyleSheet, Switch, View } from 'react-native';
import Toast from 'react-native-toast-message';

import { errorMessage } from '@/api/errors';
import { Button, Card, CardContent, CardHeader, CardTitle, ErrorState, LoadingState, Text, TimeField } from '@/components/ui';
import { useIsOnline } from '@/lib/network';
import { colors, radius } from '@/theme';

import { useOperatingHours, useSaveOperatingHours } from '../hooks';
import type { OperatingHourDraft } from '../types';
import { DAYS_OF_WEEK, formatOperatingHours, formatTo12Hour, invalidHoursDay, toHoursDraft } from '../utils';

// Web "Operating Hours" tab (GET/POST /pharmacy/operating-hours; POST is manager-only).
export function HoursTab({ manager }: { manager: boolean }) {
  const online = useIsOnline();
  const hours = useOperatingHours();
  const save = useSaveOperatingHours();
  const [draft, setDraft] = useState<OperatingHourDraft[] | null>(null);

  if (hours.isPending) return <LoadingState label="Loading operating hours..." />;
  if (hours.isError) return <ErrorState error={hours.error} onRetry={() => void hours.refetch()} />;

  const slots = hours.data.operatingHours;
  const rows = draft ?? toHoursDraft(slots);
  const status = formatOperatingHours(slots);
  const editing = draft !== null;

  const updateDay = (dayOfWeek: number, patch: Partial<OperatingHourDraft>) => setDraft((d) => (d ?? rows).map((h) => (h.dayOfWeek === dayOfWeek ? { ...h, ...patch } : h)));

  const onSave = () => {
    if (!draft) return;
    const bad = invalidHoursDay(draft);
    if (bad) {
      Toast.show({ type: 'error', text1: `${bad}: closing time must be after opening time` });
      return;
    }
    save.mutate(draft, {
      onSuccess: () => {
        setDraft(null);
        Toast.show({ type: 'success', text1: 'Operating hours updated successfully' });
      },
      onError: (err) => Toast.show({ type: 'error', text1: errorMessage(err) || 'Failed to update operating hours' }),
    });
  };

  return (
    <Card>
      <CardHeader tinted>
        <View style={styles.flex}>
          <CardTitle>Operating Hours</CardTitle>
        </View>
        {manager && !editing ? <Button title="Edit" icon={Pencil} size="sm" variant="outline" onPress={() => setDraft(toHoursDraft(slots))} /> : null}
      </CardHeader>
      <CardContent>
        {status && !editing ? (
          <View style={[styles.status, status.status === 'open' ? styles.open : styles.closed]}>
            <Clock size={16} color={status.status === 'open' ? colors.green700 : colors.red700} />
            <Text weight="semibold" color={status.status === 'open' ? colors.green800 : colors.red800}>
              {status.text}
            </Text>
          </View>
        ) : null}
        {!editing && slots.length === 0 ? (
          <Text size="sm" color={colors.gray500}>
            No operating hours set yet.
          </Text>
        ) : null}

        {rows.map((h) => (
          <View key={h.dayOfWeek} style={styles.day}>
            <View style={styles.dayHeader}>
              <Text weight="medium" color={colors.gray900} style={styles.flex}>
                {DAYS_OF_WEEK[h.dayOfWeek]}
              </Text>
              {editing ? (
                <>
                  <Text size="xs" color={h.isClosed ? colors.gray500 : colors.green700}>
                    {h.isClosed ? 'Closed' : 'Open'}
                  </Text>
                  <Switch value={!h.isClosed} onValueChange={(open) => updateDay(h.dayOfWeek, { isClosed: !open })} trackColor={{ true: colors.primary, false: colors.gray300 }} accessibilityLabel={`${DAYS_OF_WEEK[h.dayOfWeek]} open`} />
                </>
              ) : (
                <Text size="sm" color={h.isClosed ? colors.red600 : colors.gray700}>
                  {h.isClosed ? 'Closed' : `${formatTo12Hour(h.openTime)} - ${formatTo12Hour(h.closeTime)}`}
                </Text>
              )}
            </View>
            {editing && !h.isClosed ? (
              <View style={styles.times}>
                <TimeField label={`${DAYS_OF_WEEK[h.dayOfWeek]} opening time`} value={h.openTime} display={formatTo12Hour} onChange={(openTime) => updateDay(h.dayOfWeek, { openTime })} />
                <Text color={colors.gray500}>to</Text>
                <TimeField label={`${DAYS_OF_WEEK[h.dayOfWeek]} closing time`} value={h.closeTime} display={formatTo12Hour} onChange={(closeTime) => updateDay(h.dayOfWeek, { closeTime })} />
              </View>
            ) : null}
          </View>
        ))}

        {editing ? (
          <View style={styles.actions}>
            <Button title="Cancel" variant="outline" style={styles.flex} disabled={save.isPending} onPress={() => setDraft(null)} />
            <Button title="Save Hours" loadingTitle="Saving..." variant="gradient" style={styles.flex} loading={save.isPending} disabled={!online} onPress={onSave} />
          </View>
        ) : null}
      </CardContent>
    </Card>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  status: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderRadius: radius.lg, borderWidth: 2 },
  open: { backgroundColor: colors.green50, borderColor: colors.green200 },
  closed: { backgroundColor: colors.red50, borderColor: colors.red200 },
  day: { gap: 8, padding: 12, borderRadius: radius.lg, backgroundColor: colors.gray50 },
  dayHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 32 },
  times: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  actions: { flexDirection: 'row', gap: 8 },
});
