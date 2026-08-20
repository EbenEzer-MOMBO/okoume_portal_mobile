import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/text';
import { Colors, Radius } from '@/constants/theme';

export type SegmentedTabsProps<T extends string> = {
  value: T;
  options: readonly { value: T; label: string }[];
  onChange: (value: T) => void;
};

/** Bascule à deux ou trois segments (À venir / Passées). */
export function SegmentedTabs<T extends string>({ value, options, onChange }: SegmentedTabsProps<T>) {
  return (
    <View style={styles.track}>
      {options.map((option) => {
        const isActive = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            onPress={() => onChange(option.value)}
            style={[styles.segment, isActive && styles.segmentActive]}>
            <Text variant="label" tone={isActive ? 'default' : 'muted'} style={styles.label}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    gap: 3,
    backgroundColor: Colors.backgroundMuted,
    borderRadius: Radius.md,
    padding: 3,
  },
  segment: { flex: 1, height: 36, alignItems: 'center', justifyContent: 'center', borderRadius: Radius.sm },
  segmentActive: { backgroundColor: Colors.surface },
  label: { fontSize: 14 },
});
