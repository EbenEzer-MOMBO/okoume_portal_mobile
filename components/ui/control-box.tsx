import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { Colors, ControlHeight, Radius, Spacing } from '@/constants/theme';

export type ControlBoxProps = {
  value: string;
  onPress?: () => void;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
};

/** Contrôle de saisie non textuel (date, sélection) au gabarit d'un Input. */
export function ControlBox({ value, onPress, accessibilityLabel, style }: ControlBoxProps) {
  const content = (
    <View style={[styles.box, style]}>
      <Text variant="body" style={{ flex: 1 }}>{value}</Text>
      {onPress && <Icon name="chevronDown" size={16} color={Colors.textSubtle} />}
    </View>
  );

  if (!onPress) return content;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}>
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  box: {
    height: ControlHeight.input,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.surface,
  },
});
