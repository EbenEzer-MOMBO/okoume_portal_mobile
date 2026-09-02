import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Image, Pressable, StyleSheet, View, ImageSourcePropType } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@/components/ui/text';
import { Colors, Spacing, TAB_BAR_HEIGHT } from '@/constants/theme';

const houseIcon = require('@/assets/icons/house.png');
const reservationIcon = require('@/assets/icons/reservation.png');
const restaurantIcon = require('@/assets/icons/restaurant.png');
const profileIcon = require('@/assets/icons/profile.png');

const TABS: Record<string, { label: string; icon: ImageSourcePropType }> = {
  index: { label: 'Accueil', icon: houseIcon },
  reservations: { label: 'Réservations', icon: reservationIcon },
  restaurant: { label: 'Restaurant', icon: restaurantIcon },
  profil: { label: 'Profil', icon: profileIcon },
};

/** Barre d'onglets du design system : icône PNG personnalisée et libellé. */
export function TabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.bar, { height: TAB_BAR_HEIGHT + insets.bottom, paddingBottom: insets.bottom }]}>
      {state.routes.map((route, index) => {
        const tab = TABS[route.name];
        if (!tab) return null;

        const isFocused = state.index === index;
        const color = isFocused ? Colors.ink : Colors.textSubtle;

        const onPress = () => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <Pressable
            key={route.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: isFocused }}
            accessibilityLabel={tab.label}
            onPress={onPress}
            style={styles.tab}>
            <Image
              source={tab.icon}
              style={[styles.icon, { tintColor: color }]}
              resizeMode="contain"
            />
            <Text variant="caption" style={[styles.label, { color }]}>
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingTop: 9,
    backgroundColor: Colors.backgroundAlt,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  tab: { flex: 1, alignItems: 'center', gap: Spacing.xs },
  icon: { width: 22, height: 22 },
  label: { fontSize: 10, lineHeight: 14 },
});
