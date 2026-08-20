import { ActivityIndicator, Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Icon, type IconName } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { Colors, ControlHeight, Radius, Spacing } from '@/constants/theme';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'destructive';
export type ButtonSize = 'md' | 'lg';

export type ButtonProps = {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: IconName;
  loading?: boolean;
  disabled?: boolean;
  /** `false` : le bouton s'ajuste à son contenu et se centre. */
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
};

const VARIANTS: Record<ButtonVariant, { background: string; foreground: string; border?: string }> = {
  primary: { background: Colors.ink, foreground: Colors.onInk },
  secondary: { background: Colors.surface, foreground: Colors.text, border: Colors.border },
  outline: { background: 'transparent', foreground: Colors.text, border: Colors.ink },
  destructive: { background: Colors.destructive, foreground: Colors.onInk },
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  loading = false,
  disabled = false,
  fullWidth = true,
  style,
}: ButtonProps) {
  const palette = VARIANTS[variant];
  const isInactive = disabled || loading;
  const background = disabled ? Colors.border : palette.background;
  const foreground = disabled ? Colors.textSubtle : palette.foreground;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isInactive, busy: loading }}
      disabled={isInactive}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        {
          height: size === 'lg' ? ControlHeight.buttonLarge : ControlHeight.button,
          backgroundColor: background,
          borderColor: disabled ? Colors.border : (palette.border ?? background),
          alignSelf: fullWidth ? 'stretch' : 'center',
          paddingHorizontal: fullWidth ? Spacing.lg : 22,
          opacity: pressed ? 0.85 : 1,
        },
        style,
      ]}>
      <View style={styles.content}>
        {loading ? <ActivityIndicator size="small" color={foreground} /> : null}
        {icon && !loading ? <Icon name={icon} size={16} color={foreground} /> : null}
        <Text variant="bodyLg" style={[styles.label, { color: foreground }]}>
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: Radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm + 1 },
  label: { fontWeight: '500' },
});
