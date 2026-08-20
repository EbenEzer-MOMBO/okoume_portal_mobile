import { useState, type ReactNode } from 'react';
import { StyleSheet, View, type LayoutChangeEvent, type StyleProp, type ViewStyle } from 'react-native';

import { Colors } from '@/constants/theme';

const STRIPE_WIDTH = 9;

export type PhotoPlaceholderProps = {
  /** Contenu superposé (libellé de l'emplacement, badge…). */
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
};

/**
 * Emplacement photo rayé, en attendant les visuels de l'hôtel.
 * Reproduit le motif diagonal du design (rayures à 45°).
 */
export function PhotoPlaceholder({ children, style }: PhotoPlaceholderProps) {
  const [size, setSize] = useState({ width: 0, height: 0 });
  const diagonal = size.width + size.height;
  const stripeCount = diagonal > 0 ? Math.ceil(diagonal / (STRIPE_WIDTH * 2)) : 0;

  const onLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setSize({ width, height });
  };

  return (
    <View onLayout={onLayout} style={[styles.container, style]}>
      <View
        pointerEvents="none"
        style={[
          styles.stripes,
          { width: diagonal, height: diagonal, top: -size.height / 2, left: -size.width / 2 },
        ]}>
        {Array.from({ length: stripeCount }).map((_, index) => (
          <View key={index} style={styles.stripe} />
        ))}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.photoBase,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stripes: { position: 'absolute', transform: [{ rotate: '-45deg' }] },
  stripe: { height: STRIPE_WIDTH, marginBottom: STRIPE_WIDTH, backgroundColor: Colors.photoStripe },
});
