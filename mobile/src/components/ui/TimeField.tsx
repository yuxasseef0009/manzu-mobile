import DateTimePicker, { DateTimePickerAndroid, type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Clock } from 'lucide-react-native';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';

import { colors, fonts, radius } from '@/theme';

import { Button } from './Button';
import { Sheet } from './Sheet';
import { Text } from './Text';

interface TimeFieldProps {
  label: string;
  /** "HH:mm" (24h), like <input type="time">. */
  value: string;
  onChange: (value: string) => void;
  /** Formatter for the displayed value. */
  display?: (value: string) => string | null;
  disabled?: boolean;
}

function toDate(value: string): Date {
  const [h = '9', m = '0'] = value.split(':');
  const d = new Date();
  d.setHours(parseInt(h, 10) || 0, parseInt(m, 10) || 0, 0, 0);
  return d;
}

const toHHmm = (d: Date) => `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;

export function TimeField({ label, value, onChange, display, disabled }: TimeFieldProps) {
  const [iosOpen, setIosOpen] = useState(false);
  const [draft, setDraft] = useState<Date>(() => toDate(value));

  const open = () => {
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: toDate(value),
        mode: 'time',
        onChange: (event: DateTimePickerEvent, date?: Date) => {
          if (event.type === 'set' && date) onChange(toHHmm(date));
        },
      });
    } else {
      setDraft(toDate(value));
      setIosOpen(true);
    }
  };

  return (
    <View style={styles.field}>
      <Pressable
        onPress={open}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={`${label}, ${display?.(value) ?? value}`}
        style={[styles.input, disabled && styles.disabled]}
      >
        <Text style={styles.value} color={colors.gray900}>
          {display?.(value) ?? value}
        </Text>
        <Clock size={14} color={colors.gray500} />
      </Pressable>
      {Platform.OS !== 'android' ? (
        <Sheet visible={iosOpen} onClose={() => setIosOpen(false)} title={label}>
          <DateTimePicker value={draft} mode="time" display="spinner" onChange={(_e, d) => d && setDraft(d)} accentColor={colors.primary} />
          <Button
            title="Done"
            variant="gradient"
            fullWidth
            onPress={() => {
              onChange(toHHmm(draft));
              setIosOpen(false);
            }}
          />
        </Sheet>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { flex: 1 },
  input: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 6, minHeight: 44, paddingHorizontal: 12, borderWidth: 1, borderColor: colors.gray300, borderRadius: radius.lg, backgroundColor: colors.white },
  disabled: { opacity: 0.6 },
  value: { fontFamily: fonts.regular },
});
