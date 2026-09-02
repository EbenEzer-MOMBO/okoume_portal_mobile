import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Colors, Radius, Spacing } from '@/constants/theme';

export type SkeletonProps = {
  width?: number | `${number}%`;
  height?: number;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
};

/** Composant générique d'effet shimmer / squelette animé avec pulsation d'opacité. */
export function Skeleton({ width = '100%', height = 20, borderRadius = Radius.sm, style }: SkeletonProps) {
  const opacity = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.85,
          duration: 750,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.35,
          duration: 750,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          opacity,
        },
        style,
      ]}
    />
  );
}

/** Squelette de chargement pour les cartes de chambre (RoomCard) */
export function RoomCardSkeleton() {
  return (
    <View style={styles.cardSkeleton}>
      <Skeleton height={180} borderRadius={0} />
      <View style={styles.cardBody}>
        <View style={styles.rowBetween}>
          <Skeleton width="55%" height={18} />
          <Skeleton width="30%" height={18} />
        </View>
        <Skeleton width="45%" height={14} />
        <Skeleton width="65%" height={12} />
      </View>
    </View>
  );
}

/** Squelette de chargement pour les cartes de plat (MenuCard) */
export function MenuCardSkeleton() {
  return (
    <View style={styles.menuCardSkeleton}>
      <Skeleton height={130} borderRadius={0} />
      <View style={styles.menuCardBody}>
        <Skeleton width="80%" height={14} />
        <Skeleton width="60%" height={11} />
        <View style={styles.rowBetween}>
          <Skeleton width="40%" height={14} />
          <Skeleton width={26} height={26} borderRadius={0} />
        </View>
      </View>
    </View>
  );
}

/** Squelette de chargement pour l'historique des commandes (CommandeCard) */
export function OrderCardSkeleton() {
  return (
    <View style={styles.orderCardSkeleton}>
      <View style={styles.rowBetween}>
        <View style={{ gap: 6, flex: 1 }}>
          <Skeleton width="40%" height={12} />
          <Skeleton width="60%" height={10} />
          <Skeleton width="30%" height={18} />
        </View>
        <Skeleton width="25%" height={20} />
      </View>
      <View style={styles.divider} />
      <View style={{ gap: 8 }}>
        <Skeleton width="90%" height={14} />
        <Skeleton width="75%" height={14} />
      </View>
    </View>
  );
}

/** Squelette de chargement pour les réservations (ReservationCard) */
export function ReservationCardSkeleton() {
  return (
    <View style={styles.reservationCardSkeleton}>
      <View style={styles.rowBetween}>
        <View style={{ gap: 4, flex: 1 }}>
          <Skeleton width="50%" height={16} />
          <Skeleton width="35%" height={12} />
        </View>
        <Skeleton width="30%" height={20} />
      </View>
      <View style={styles.rowGap}>
        <Skeleton width={80} height={80} borderRadius={0} />
        <View style={{ flex: 1, gap: 8 }}>
          <Skeleton width="80%" height={14} />
          <Skeleton width="60%" height={14} />
          <Skeleton width="70%" height={14} />
        </View>
      </View>
      <Skeleton width="100%" height={44} borderRadius={0} />
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: Colors.borderStrong || '#D6D3D1',
  },
  cardSkeleton: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  cardBody: {
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  menuCardSkeleton: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  menuCardBody: {
    padding: Spacing.sm,
    gap: 6,
  },
  orderCardSkeleton: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  reservationCardSkeleton: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  rowGap: {
    flexDirection: 'row',
    gap: Spacing.md,
    alignItems: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
  },
});
