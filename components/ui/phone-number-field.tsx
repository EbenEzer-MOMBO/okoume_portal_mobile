import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Field } from '@/components/ui/field';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { Colors, ControlHeight, FontFamily, Radius, Spacing } from '@/constants/theme';
import { composePhone, isValidPhone, parsePhone, PHONE_COUNTRIES, type PhoneCountry } from '@/lib/phone';

export type PhoneNumberFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  onValidationChange?: (isValid: boolean) => void;
};

export function PhoneNumberField({
  label,
  value,
  onChange,
  error,
  onValidationChange,
}: PhoneNumberFieldProps) {
  const parsed = useMemo(() => parsePhone(value), [value]);
  const country = parsed.country;
  const nationalNumber = parsed.nationalNumber;
  const [open, setOpen] = useState(false);

  const emit = (nextCountry: PhoneCountry, nextNational: string) => {
    const next = composePhone(nextCountry, nextNational);
    onChange(next);
    onValidationChange?.(isValidPhone(next));
  };

  const selectCountry = (next: PhoneCountry) => {
    const limited = nationalNumber.slice(0, next.phoneLength);
    emit(next, limited);
    setOpen(false);
  };

  return (
    <Field label={label} error={error}>
      <View style={[styles.row, error ? styles.rowError : null]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Indicatif ${country.dialCode}`}
          onPress={() => setOpen(true)}
          style={({ pressed }) => [styles.dial, { opacity: pressed ? 0.7 : 1 }]}>
          <Text variant="body">{country.flag}</Text>
          <Text variant="body">{country.dialCode}</Text>
        </Pressable>

        <TextInput
          value={nationalNumber}
          onChangeText={(text) => emit(country, text)}
          keyboardType="phone-pad"
          placeholder={'X'.repeat(country.phoneLength)}
          placeholderTextColor={Colors.textSubtle}
          maxLength={country.phoneLength}
          style={styles.input}
        />
      </View>

      <BottomSheet visible={open} onClose={() => setOpen(false)} title="Indicatif">
        <View style={styles.options}>
          {PHONE_COUNTRIES.map((option) => {
            const selected = option.code === country.code;
            return (
              <Pressable
                key={option.code}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                onPress={() => selectCountry(option)}
                style={({ pressed }) => [
                  styles.option,
                  { borderColor: selected ? Colors.ink : Colors.border, opacity: pressed ? 0.7 : 1 },
                ]}>
                <Text variant="bodyLg">
                  {option.flag}  {option.name}
                </Text>
                <View style={styles.optionMeta}>
                  <Text variant="body" tone="muted">
                    {option.dialCode}
                  </Text>
                  {selected ? <Icon name="check" size={17} color={Colors.ink} /> : null}
                </View>
              </Pressable>
            );
          })}
        </View>
      </BottomSheet>
    </Field>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    height: ControlHeight.input,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    overflow: 'hidden',
  },
  rowError: { borderColor: Colors.destructive },
  dial: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    height: '100%',
    paddingHorizontal: Spacing.md,
    borderRightWidth: 1,
    borderRightColor: Colors.border,
  },
  input: {
    flex: 1,
    height: '100%',
    paddingHorizontal: Spacing.md,
    fontFamily: FontFamily.sans,
    fontSize: 15,
    color: Colors.text,
  },
  options: { gap: Spacing.sm + 1 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.lg - 1,
    paddingVertical: Spacing.md + 2,
  },
  optionMeta: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
});
