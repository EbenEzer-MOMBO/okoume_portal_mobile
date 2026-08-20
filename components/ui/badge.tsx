import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/text';
import { Colors, Radius } from '@/constants/theme';

export type BadgeTone = 'dark' | 'muted' | 'destructive' | 'onDark';

export type BadgeProps = {
  label: string;
  tone?: BadgeTone;
};

const TONES: Record<BadgeTone, { background: string; foreground: string }> = {
  dark: { background: Colors.ink, foreground: Colors.onInk },
  muted: { background: Colors.badgeMutedBg, foreground: Colors.badgeMutedFg },
  destructive: { background: Colors.destructive, foreground: Colors.onInk },
  onDark: { background: Colors.onInkDivider, foreground: Colors.onInk },
};

export function Badge({ label, tone = 'dark' }: BadgeProps) {
  const palette = TONES[tone];
  return (
    <View style={[styles.badge, { backgroundColor: palette.background }]}>
      <Text variant="caption" style={[styles.label, { color: palette.foreground }]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { alignSelf: 'flex-start', borderRadius: Radius.pill, paddingHorizontal: 9, paddingVertical: 4 },
  label: { fontSize: 11, lineHeight: 15, fontWeight: '500' },
});
