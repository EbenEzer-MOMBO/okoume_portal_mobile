import { ScrollView, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Spacing, TAB_BAR_HEIGHT } from '@/constants/theme';

export type ScreenScrollProps = {
  children: React.ReactNode;
  /** Réserve la hauteur de la barre d'onglets en bas du contenu. */
  withTabBar?: boolean;
  paddingHorizontal?: number;
  paddingTop?: number;
  contentStyle?: StyleProp<ViewStyle>;
};

/** Zone scrollable d'un écran, avec les marges standard du design system. */
export function ScreenScroll({
  children,
  withTabBar = false,
  paddingHorizontal = Spacing.xl,
  paddingTop = Spacing.xl,
  contentStyle,
}: ScreenScrollProps) {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={styles.scroll}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[
        {
          paddingHorizontal,
          paddingTop,
          paddingBottom: withTabBar ? TAB_BAR_HEIGHT + insets.bottom + Spacing['2xl'] : Spacing['3xl'],
        },
        contentStyle,
      ]}>
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
});
