import { AlertCircle, Building2, CheckCircle, ChevronDown, Clock, Info, Lock } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Toast from 'react-native-toast-message';

import { errorMessage } from '@/api/errors';
import { Button, Card, ErrorState, Input, Skeleton, Text } from '@/components/ui';
import { useIsManager } from '@/features/auth/hooks';
import { useIsOnline } from '@/lib/network';
import { colors, radius } from '@/theme';

import { useBankingStatus, useBanks, useSaveBankAccount, useVerifyBankAccount } from '../hooks';
import type { Bank, BankingStatus } from '../types';
import { BankPickerSheet } from './BankPickerSheet';

function DetailRow({ label, value }: { label: string; value: string | null }) {
  return (
    <View style={styles.detail}>
      <Text color={colors.gray600}>{label}</Text>
      <Text weight="semibold" color={colors.gray900} style={styles.detailValue} numberOfLines={1}>
        {value || '—'}
      </Text>
    </View>
  );
}

function ConfiguredCard({ status, onUpdate }: { status: BankingStatus; onUpdate?: () => void }) {
  return (
    <Card style={styles.card}>
      <View style={styles.headerRow}>
        <View style={[styles.headerIcon, { backgroundColor: colors.green100 }]}>
          <CheckCircle size={22} color={colors.green600} />
        </View>
        <View style={styles.flex}>
          <Text size="base" weight="bold" color={colors.gray900}>
            Banking Configured
          </Text>
          <Text size="xs" color={colors.gray600}>
            Your account is ready to receive payouts
          </Text>
        </View>
      </View>
      <View style={styles.details}>
        <DetailRow label="Bank Name" value={status.bankName} />
        <DetailRow label="Account Number" value={status.accountNumber} />
        <DetailRow label="Account Name" value={status.accountName} />
      </View>
      {onUpdate ? <Button title="Update Banking Details" variant="outline" onPress={onUpdate} /> : null}
    </Card>
  );
}

function ManagerOnlyNote({ hasSetup }: { hasSetup: boolean }) {
  return (
    <View style={styles.note}>
      <Lock size={16} color={colors.gray500} />
      <Text size="xs" color={colors.gray600} style={styles.flex}>
        {hasSetup ? 'Only a manager can update banking details.' : 'Only a manager can set up the bank account for payouts.'}
      </Text>
    </View>
  );
}

// BankingSetupCard from payment/page.jsx: pick bank → 10-digit account → verify → setup/update.
function BankForm({ hasSetup, onDone }: { hasSetup: boolean; onDone: () => void }) {
  const online = useIsOnline();
  const banks = useBanks(true);
  const verify = useVerifyBankAccount();
  const save = useSaveBankAccount();
  const [bank, setBank] = useState<Bank | null>(null);
  const [accountNumber, setAccountNumber] = useState('');
  const [verifiedName, setVerifiedName] = useState('');
  const [error, setError] = useState('');
  const [pickerOpen, setPickerOpen] = useState(false);

  const bankList = banks.data?.banks ?? [];
  const banksFailed = banks.isError || (banks.isSuccess && bankList.length === 0);
  const busy = verify.isPending || save.isPending;

  const resetVerification = () => {
    setVerifiedName('');
    setError('');
  };

  const onVerify = () => {
    if (accountNumber.length !== 10) return setError('Account number must be 10 digits');
    if (!bank) return setError('Please select a bank');
    setError('');
    verify.mutate(
      { accountNumber, bankCode: bank.code },
      { onSuccess: (res) => setVerifiedName(res.accountName), onError: (err) => setError(errorMessage(err)) },
    );
  };

  const onSubmit = () => {
    if (!verifiedName || !bank) return setError('Please verify account first');
    setError('');
    save.mutate(
      { body: { accountNumber, bankCode: bank.code, bankName: bank.name }, mode: hasSetup ? 'update' : 'setup' },
      {
        onSuccess: (res) => {
          Toast.show({ type: 'success', text1: res.message || 'Banking details saved', text2: res.accountName });
          onDone();
        },
        onError: (err) => setError(errorMessage(err)),
      },
    );
  };

  return (
    <Card style={styles.card}>
      <View style={styles.headerRow}>
        <View style={[styles.headerIcon, { backgroundColor: colors.blue100 }]}>
          <Building2 size={22} color={colors.brandBlue} />
        </View>
        <View style={styles.flex}>
          <Text size="base" weight="bold" color={colors.gray900}>
            {hasSetup ? 'Update Banking Details' : 'Setup Bank Account'}
          </Text>
          <Text size="xs" color={colors.gray600}>
            {hasSetup ? 'Update your bank account information' : 'Configure your bank account to receive payouts'}
          </Text>
        </View>
      </View>

      {error ? (
        <View style={styles.error} accessibilityRole="alert">
          <AlertCircle size={16} color={colors.red600} />
          <Text size="sm" color={colors.red700} style={styles.flex}>
            {error}
          </Text>
        </View>
      ) : null}

      <View style={styles.field}>
        <Text weight="medium" color={colors.gray700}>
          Select Bank *
        </Text>
        {banksFailed ? (
          <View style={styles.inlineError}>
            <Text size="sm" color={colors.red600} style={styles.flex}>
              Failed to load banks list
            </Text>
            <Button title="Retry" size="sm" variant="outline" onPress={() => void banks.refetch()} loading={banks.isFetching} />
          </View>
        ) : (
          <Pressable
            onPress={() => setPickerOpen(true)}
            disabled={banks.isPending || busy}
            accessibilityRole="button"
            accessibilityLabel="Select bank"
            style={[styles.select, (banks.isPending || busy) && styles.disabled]}
          >
            <Text size="base" color={bank ? colors.gray900 : colors.gray400} style={styles.flex} numberOfLines={1}>
              {banks.isPending ? 'Loading banks...' : bank?.name ?? 'Choose your bank'}
            </Text>
            <ChevronDown size={18} color={colors.gray500} />
          </Pressable>
        )}
      </View>

      <Input
        label="Account Number"
        required
        value={accountNumber}
        onChangeText={(v) => {
          setAccountNumber(v.replace(/\D/g, '').slice(0, 10));
          resetVerification();
        }}
        placeholder="0123456789"
        keyboardType="number-pad"
        maxLength={10}
        editable={!busy}
      />
      <Text size="xs" color={colors.gray500}>
        Enter your 10-digit account number
      </Text>

      {verifiedName ? (
        <View style={styles.verified}>
          <CheckCircle size={20} color={colors.green600} />
          <View style={styles.flex}>
            <Text weight="semibold" color={colors.green800}>
              Account Verified
            </Text>
            <Text color={colors.green700}>{verifiedName}</Text>
          </View>
        </View>
      ) : null}

      <View style={styles.actions}>
        {hasSetup ? <Button title="Cancel" variant="outline" onPress={onDone} disabled={busy} style={styles.flex} /> : null}
        {!verifiedName ? (
          <Button
            title="Verify Account"
            loadingTitle="Verifying..."
            loading={verify.isPending}
            disabled={!online || accountNumber.length !== 10 || !bank}
            onPress={onVerify}
            style={styles.flex}
          />
        ) : (
          <Button
            title={hasSetup ? 'Update Banking' : 'Complete Setup'}
            loadingTitle={hasSetup ? 'Updating...' : 'Setting up...'}
            icon={CheckCircle}
            loading={save.isPending}
            disabled={!online}
            onPress={onSubmit}
            style={styles.flex}
          />
        )}
      </View>

      <View style={styles.info}>
        <Info size={16} color={colors.blue600} />
        <View style={styles.flex}>
          <Text size="xs" weight="semibold" color={colors.blue900}>
            Important:
          </Text>
          <Text size="xs" color={colors.blue800}>• Payouts are processed daily at 11 PM</Text>
          <Text size="xs" color={colors.blue800}>{'• Orders must be marked as "Completed" to be eligible'}</Text>
          <Text size="xs" color={colors.blue800}>• Funds arrive within 24 hours (T+1)</Text>
        </View>
      </View>

      <BankPickerSheet
        visible={pickerOpen}
        banks={bankList}
        selectedCode={bank?.code ?? ''}
        onSelect={(b) => {
          setBank(b);
          resetVerification();
        }}
        onClose={() => setPickerOpen(false)}
      />
    </Card>
  );
}

const SCHEDULE = [
  { title: 'Complete Orders', body: 'Mark orders as "Completed" after customer pickup/delivery' },
  { title: 'Daily Processing', body: 'All completed orders batched at 11 PM daily' },
  { title: 'Receive Payment', body: 'Funds arrive in your account within 24 hours (T+1)' },
];

const FAQ = [
  { q: 'When do I receive payouts?', a: 'Payouts are processed daily at 11 PM Lagos time. All orders marked as "Completed" will be included in that day\'s batch. Funds typically arrive in your account within 24 hours (T+1).' },
  { q: 'What is the commission rate?', a: 'We charge a simple flat rate of 8% commission on all orders, regardless of order value. This means you keep 92% of every sale.' },
  { q: 'Can I update my bank account?', a: 'Yes, a manager can update the bank account anytime using "Update Banking Details" above. The new account will be verified before activation.' },
  { q: 'What if a payout fails?', a: 'Failed payouts are automatically retried every 2 hours. If issues persist, our support team will contact you. Ensure your bank account details are correct to avoid failures.' },
];

function ScheduleCard() {
  return (
    <Card style={styles.card}>
      <View style={styles.headerRow}>
        <Clock size={18} color={colors.brandBlue} />
        <Text size="base" weight="semibold" color={colors.gray900}>
          Payout Schedule & Process
        </Text>
      </View>
      {SCHEDULE.map((s, i) => (
        <View key={s.title} style={styles.step}>
          <View style={styles.stepNum}>
            <Text size="xs" weight="bold" color={colors.white}>
              {i + 1}
            </Text>
          </View>
          <View style={styles.flex}>
            <Text weight="semibold" color={colors.gray900}>
              {s.title}
            </Text>
            <Text size="xs" color={colors.gray600}>
              {s.body}
            </Text>
          </View>
        </View>
      ))}
    </Card>
  );
}

function FaqCard() {
  return (
    <Card style={styles.card}>
      <View style={styles.headerRow}>
        <Info size={18} color={colors.brandBlue} />
        <Text size="base" weight="semibold" color={colors.gray900}>
          Frequently Asked Questions
        </Text>
      </View>
      {FAQ.map((f) => (
        <View key={f.q} style={styles.faq}>
          <Text weight="semibold" color={colors.gray900}>
            {f.q}
          </Text>
          <Text size="xs" color={colors.gray600}>
            {f.a}
          </Text>
        </View>
      ))}
    </Card>
  );
}

export function BankTab() {
  const manager = useIsManager();
  const status = useBankingStatus();
  const [editing, setEditing] = useState(false);

  let content;
  if (status.isPending) content = <Skeleton height={220} style={styles.skeleton} />;
  else if (status.isError) content = <ErrorState error={status.error} title="Failed to fetch banking status" onRetry={() => void status.refetch()} />;
  else {
    const s = status.data;
    const showForm = manager && (editing || !s.hasSetup);
    content = (
      <>
        {showForm ? (
          <BankForm hasSetup={s.hasSetup} onDone={() => setEditing(false)} />
        ) : s.hasSetup ? (
          <ConfiguredCard status={s} onUpdate={manager ? () => setEditing(true) : undefined} />
        ) : null}
        {!manager ? <ManagerOnlyNote hasSetup={s.hasSetup} /> : null}
      </>
    );
  }

  return (
    <View style={styles.container}>
      {content}
      <ScheduleCard />
      <FaqCard />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  container: { gap: 16 },
  card: { padding: 16, gap: 12 },
  skeleton: { borderRadius: radius['2xl'] },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerIcon: { padding: 10, borderRadius: radius.lg },
  details: { gap: 8, padding: 12, borderRadius: radius.lg, backgroundColor: colors.gray50 },
  detail: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  detailValue: { flexShrink: 1, textAlign: 'right' },
  note: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderRadius: radius.lg, backgroundColor: colors.gray100 },
  error: { flexDirection: 'row', gap: 8, padding: 12, borderRadius: radius.lg, backgroundColor: colors.red50, borderWidth: 1, borderColor: colors.red200 },
  field: { gap: 6 },
  inlineError: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  select: { flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 44, paddingHorizontal: 12, borderWidth: 1, borderColor: colors.gray300, borderRadius: radius.lg, backgroundColor: colors.white },
  disabled: { opacity: 0.6 },
  verified: { flexDirection: 'row', gap: 10, padding: 12, borderRadius: radius.lg, backgroundColor: colors.green50, borderWidth: 2, borderColor: colors.green200 },
  actions: { flexDirection: 'row', gap: 12 },
  info: { flexDirection: 'row', gap: 8, padding: 12, borderRadius: radius.lg, backgroundColor: colors.blue50, borderWidth: 1, borderColor: colors.blue200 },
  step: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  stepNum: { width: 24, height: 24, borderRadius: 12, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  faq: { gap: 4, paddingTop: 8, borderTopWidth: 1, borderTopColor: colors.gray100 },
});
