import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { BottomSheet } from '@/components/ui/bottom-sheet';
import { ControlBox } from '@/components/ui/control-box';
import { Field } from '@/components/ui/field';
import { Icon, type IconName } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { Colors, Radius, Spacing } from '@/constants/theme';

export type SelectOption = { value: string; label: string };

export type SelectFieldProps = {
  label: string;
  icon?: IconName;
  value: string;
  options: readonly SelectOption[];
  onChange: (value: string) => void;
};

/** Sélecteur natif : contrôle fermé + feuille de choix. */
export function SelectField({ label, icon, value, options, onChange }: SelectFieldProps) {
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.value === value);

  const select = (next: string) => {
    onChange(next);
    setOpen(false);
  };

  return (
    <Field label={label} icon={icon}>
      <ControlBox value={selected?.label ?? value} accessibilityLabel={label} onPress={() => setOpen(true)} />

      <BottomSheet visible={open} onClose={() => setOpen(false)} title={label}>
        <View style={styles.options}>
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <Pressable
                key={option.value}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                onPress={() => select(option.value)}
                style={({ pressed }) => [
                  styles.option,
                  { borderColor: isSelected ? Colors.ink : Colors.border, opacity: pressed ? 0.7 : 1 },
                ]}>
                <Text variant="bodyLg">{option.label}</Text>
                {isSelected ? <Icon name="check" size={17} color={Colors.ink} /> : null}
              </Pressable>
            );
          })}
        </View>
      </BottomSheet>
    </Field>
  );
}

const styles = StyleSheet.create({
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
});
