import { StyleSheet, View, type StyleProp, type ViewProps, type ViewStyle } from 'react-native';

import { Colors, Radius, Shadow, Spacing } from '@/constants/theme';

export type CardProps = ViewProps & {
  /** `dark` : carte pleine noir bois (bandeau séjour, mise en avant). */
  tone?: 'surface' | 'dark';
  /** `false` : pas de padding interne (listes de lignes séparées). */
  padded?: boolean;
  elevated?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function Card({ tone = 'surface', padded = true, elevated = false, style, ...props }: CardProps) {
  return (
    <View
      {...props}
      style={[
        styles.base,
        tone === 'dark' ? styles.dark : styles.surface,
        padded && styles.padded,
        elevated && Shadow.card,
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  base: { borderRadius: Radius.md, overflow: 'hidden' },
  surface: { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border },
  dark: { backgroundColor: Colors.ink },
  padded: { padding: Spacing.lg },
});
