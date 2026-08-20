import { Pressable, StyleSheet } from 'react-native';

import { Text } from '@/components/ui/text';
import { Colors, Radius } from '@/constants/theme';

export type ChipProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
};

/** Filtre sélectionnable (prix, équipements). */
export function Chip({ label, selected, onPress }: ChipProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[
        styles.chip,
        {
          backgroundColor: selected ? Colors.ink : Colors.surface,
          borderColor: selected ? Colors.ink : Colors.border,
        },
      ]}>
      <Text variant="bodySm" style={{ color: selected ? Colors.onInk : Colors.text }}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: { borderRadius: Radius.pill, borderWidth: 1, paddingHorizontal: 13, paddingVertical: 8 },
});
