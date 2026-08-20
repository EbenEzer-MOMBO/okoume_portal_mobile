import { Pressable, type StyleProp, type ViewStyle } from 'react-native';

import { Text, type TextTone } from '@/components/ui/text';

export type TextButtonProps = {
  label: string;
  onPress: () => void;
  tone?: TextTone;
  align?: 'left' | 'center';
  underline?: boolean;
  style?: StyleProp<ViewStyle>;
};

/** Lien textuel (bascule d'authentification, actions discrètes). */
export function TextButton({
  label,
  onPress,
  tone = 'default',
  align = 'center',
  underline = false,
  style,
}: TextButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }, style]}>
      <Text
        variant="bodySm"
        tone={tone}
        style={{ textAlign: align, textDecorationLine: underline ? 'underline' : 'none' }}>
        {label}
      </Text>
    </Pressable>
  );
}
