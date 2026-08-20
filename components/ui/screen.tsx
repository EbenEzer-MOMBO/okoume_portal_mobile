import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { Colors } from '@/constants/theme';

export type ScreenProps = {
  children: React.ReactNode;
  /** Fond crème (`default`) ou crème clair (`alt`). */
  tone?: 'default' | 'alt';
  /** Bords protégés par la safe area. */
  edges?: readonly Edge[];
  style?: StyleProp<ViewStyle>;
};

/** Conteneur plein écran appliquant le fond et la safe area du design system. */
export function Screen({ children, tone = 'default', edges = ['top'], style }: ScreenProps) {
  const backgroundColor = tone === 'alt' ? Colors.backgroundAlt : Colors.background;

  return (
    <View style={[styles.root, { backgroundColor }]}>
      <SafeAreaView edges={edges} style={[styles.root, style]}>
        {children}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
