import { Pressable, StyleSheet, View } from 'react-native';

import { Colors, Radius } from '@/constants/theme';

export type ToggleProps = {
  value: boolean;
  onValueChange: () => void;
  accessibilityLabel: string;
};

/** Interrupteur au gabarit du design system (44 × 26). */
export function Toggle({ value, onValueChange, accessibilityLabel }: ToggleProps) {
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ checked: value }}
      onPress={onValueChange}
      style={[
        styles.track,
        { backgroundColor: value ? Colors.ink : Colors.border, justifyContent: value ? 'flex-end' : 'flex-start' },
      ]}>
      <View style={styles.knob} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  track: { width: 44, height: 26, borderRadius: Radius.pill, padding: 3, flexDirection: 'row' },
  knob: {
    width: 20,
    height: 20,
    borderRadius: Radius.pill,
    backgroundColor: Colors.surface,
    shadowColor: Colors.ink,
    shadowOpacity: 0.2,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
});
