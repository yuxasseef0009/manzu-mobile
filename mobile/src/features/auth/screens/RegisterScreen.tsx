import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { ArrowLeft, ArrowRight, Building2, MapPin, UserPlus } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Controller, useForm, useWatch, type FieldPath } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import Toast from 'react-native-toast-message';

import { errorMessage } from '@/api/errors';
import { Button, Card, CardContent, CardHeader, Input, PinInput, Screen, SelectField, Text } from '@/components/ui';
import { GpsCaptureCard } from '@/features/location/GpsCaptureCard';
import { useGpsCapture } from '@/features/location/useGpsCapture';
import { useIsOnline } from '@/lib/network';
import { lgasForState, NIGERIAN_STATES } from '@/lib/nigeria';
import { colors, gradients, radius } from '@/theme';

import { useRegister } from '../hooks';
import { registerSchema, type RegisterFormValues } from '../schemas';

const STEPS = [
  { title: 'Pharmacy Details', icon: Building2, fields: ['name', 'licenseNumber', 'phone'] },
  { title: 'Location', icon: MapPin, fields: ['address', 'state', 'lga', 'latitude', 'longitude'] },
  { title: 'Manager Account', icon: UserPlus, fields: ['userName', 'email', 'pin', 'confirmPin'] },
] as const satisfies readonly { title: string; icon: unknown; fields: readonly FieldPath<RegisterFormValues>[] }[];

// manzu-f (auth)/register/page.jsx split into three steps; GPS via expo-location (usePharmacyGPSCapture port).
export function RegisterScreen() {
  const router = useRouter();
  const online = useIsOnline();
  const registerMutation = useRegister();
  const gps = useGpsCapture();
  const [step, setStep] = useState(0);

  const { control, handleSubmit, formState, trigger, setValue } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', licenseNumber: '', phone: '', address: '', state: '', lga: '', latitude: 0, longitude: 0, locationAccuracy: 0, userName: '', email: '', pin: '', confirmPin: '' },
  });
  const state = useWatch({ control, name: 'state' });
  const { errors } = formState;

  useEffect(() => {
    if (gps.status === 'done' && gps.fix) {
      setValue('latitude', gps.fix.latitude, { shouldValidate: true });
      setValue('longitude', gps.fix.longitude, { shouldValidate: true });
      setValue('locationAccuracy', gps.fix.accuracy);
    }
  }, [gps.status, gps.fix, setValue]);

  const current = STEPS[step] ?? STEPS[0];
  const isLast = step === STEPS.length - 1;

  const next = async () => {
    if (await trigger([...current.fields])) setStep((s) => s + 1);
  };

  const onSubmit = handleSubmit(
    (v) => {
      registerMutation.mutate(
        {
          pharmacy: {
            name: v.name,
            licenseNumber: v.licenseNumber,
            phone: v.phone,
            address: v.address,
            state: v.state,
            lga: v.lga,
            latitude: v.latitude,
            longitude: v.longitude,
            ...(v.locationAccuracy > 0 ? { locationAccuracy: Math.max(1, Math.round(v.locationAccuracy)) } : {}),
          },
          user: { name: v.userName, email: v.email, pin: v.pin },
        },
        {
          onSuccess: () => Toast.show({ type: 'success', text1: 'Registration successful!', text2: 'Your pharmacy is pending verification.' }),
          onError: (err) => Toast.show({ type: 'error', text1: errorMessage(err) || 'Registration failed. Please try again.' }),
        },
      );
    },
    (errs) => {
      const firstStep = STEPS.findIndex((s) => s.fields.some((f) => f in errs));
      if (firstStep >= 0 && firstStep !== step) setStep(firstStep);
    },
  );

  const textField = (name: 'name' | 'licenseNumber' | 'phone' | 'address' | 'userName' | 'email', label: string, extra: Partial<React.ComponentProps<typeof Input>> = {}) => (
    <Controller control={control} name={name} render={({ field: { value, onChange, onBlur } }) => <Input label={label} required value={value} onChangeText={onChange} onBlur={onBlur} error={errors[name]?.message} {...extra} />} />
  );

  const Icon = current.icon;
  const locationError = errors.latitude?.message ?? errors.longitude?.message;

  return (
    <Screen background={gradients.loginBackground} edges={['top', 'bottom']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <View style={styles.container}>
          <Text size="2xl" weight="bold" color={colors.brandBlue} align="center">
            Register Your Pharmacy
          </Text>
          <View style={styles.steps} accessibilityLabel={`Step ${step + 1} of ${STEPS.length}`}>
            {STEPS.map((s, i) => (
              <View key={s.title} style={[styles.stepBar, i <= step && styles.stepBarActive]} />
            ))}
          </View>

          <Card elevated>
            <CardHeader tinted>
              <Icon size={18} color={colors.primary} />
              <Text size="lg" weight="bold" color={colors.brandBlue} style={styles.flex}>
                {current.title}
              </Text>
              <Text size="xs" color={colors.gray500}>
                {step + 1}/{STEPS.length}
              </Text>
            </CardHeader>
            <CardContent>
              {step === 0 ? (
                <>
                  {textField('name', 'Pharmacy Name', { placeholder: 'e.g. HealthPlus Pharmacy', autoCapitalize: 'words' })}
                  {textField('licenseNumber', 'PCN License Number', { placeholder: 'e.g. PCN/12345', autoCapitalize: 'characters' })}
                  {textField('phone', 'Phone Number', { placeholder: '08012345678', keyboardType: 'phone-pad', autoComplete: 'tel' })}
                </>
              ) : step === 1 ? (
                <>
                  {textField('address', 'Street Address', { placeholder: 'Full street address', multiline: true })}
                  <Controller
                    control={control}
                    name="state"
                    render={({ field: { value } }) => (
                      <SelectField
                        label="State"
                        required
                        searchable
                        value={value}
                        options={NIGERIAN_STATES}
                        onChange={(s) => {
                          setValue('state', s, { shouldValidate: true });
                          if (s !== value) setValue('lga', '');
                        }}
                        placeholder="Select state"
                        error={errors.state?.message}
                      />
                    )}
                  />
                  <Controller
                    control={control}
                    name="lga"
                    render={({ field: { value, onChange } }) => (
                      <SelectField label="LGA" required searchable value={value} options={lgasForState(state)} onChange={onChange} placeholder={state ? 'Select LGA' : 'Select a state first'} disabled={!state} error={errors.lga?.message} />
                    )}
                  />
                  <GpsCaptureCard gps={gps} disabled={registerMutation.isPending} />
                  {locationError && gps.status !== 'done' ? (
                    <Text size="xs" color={colors.red600}>
                      {locationError}
                    </Text>
                  ) : null}
                </>
              ) : (
                <>
                  {textField('userName', 'Your Full Name', { placeholder: 'Pharmacy manager name', autoCapitalize: 'words', autoComplete: 'name' })}
                  {textField('email', 'Email', { placeholder: 'you@example.com', keyboardType: 'email-address', autoCapitalize: 'none', autoComplete: 'email', textContentType: 'emailAddress' })}
                  <Controller control={control} name="pin" render={({ field: { value, onChange } }) => <PinInput label="Create 6-Digit PIN" value={value} onChange={onChange} error={errors.pin?.message} />} />
                  <Controller control={control} name="confirmPin" render={({ field: { value, onChange } }) => <PinInput label="Confirm PIN" value={value} onChange={onChange} onSubmit={onSubmit} error={errors.confirmPin?.message} />} />
                  <Text size="xs" color={colors.gray500}>
                    You will be the pharmacy manager. New pharmacies start as pending until Manzu verifies them.
                  </Text>
                </>
              )}

              <View style={styles.actions}>
                {step > 0 ? <Button title="Back" icon={ArrowLeft} variant="outline" style={styles.flex} disabled={registerMutation.isPending} onPress={() => setStep((s) => s - 1)} /> : null}
                {isLast ? (
                  <Button title="Register" loadingTitle="Registering..." variant="gradient" style={styles.flex} loading={registerMutation.isPending} disabled={!online} onPress={onSubmit} />
                ) : (
                  <Button title="Next" icon={ArrowRight} variant="gradient" style={styles.flex} disabled={step === 1 && gps.capturing} onPress={() => void next()} />
                )}
              </View>
              {!online ? (
                <Text size="xs" color={colors.orange600} align="center">
                  {"You're offline. Connect to the internet to register."}
                </Text>
              ) : null}
              <Button title="Already have an account? Sign in" variant="ghost" fullWidth onPress={() => (router.canGoBack() ? router.back() : router.replace('/login'))} />
            </CardContent>
          </Card>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, justifyContent: 'center', width: '100%', maxWidth: 448, alignSelf: 'center', paddingVertical: 24, gap: 16 },
  steps: { flexDirection: 'row', gap: 6 },
  stepBar: { flex: 1, height: 4, borderRadius: radius.full, backgroundColor: colors.gray200 },
  stepBarActive: { backgroundColor: colors.primary },
  actions: { flexDirection: 'row', gap: 8 },
});
