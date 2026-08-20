import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon, type IconName } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { Colors, Radius, Spacing, TAB_BAR_HEIGHT } from '@/constants/theme';
import { useAppStore } from '@/store/app-store';

const TABS: Record<string, { label: string; icon: IconName }> = {
  index: { label: 'Accueil', icon: 'home' },
  sejour: { label: 'Séjour', icon: 'bed' },
  reservations: { label: 'Réservations', icon: 'clock' },
  notifications: { label: 'Alertes', icon: 'bell' },
  profil: { label: 'Profil', icon: 'profile' },
};

/** Barre d'onglets du design system : icône, libellé, pastille de non-lus. */
export function TabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { unreadCount, hasStay } = useAppStore();
  const showBadge = hasStay && unreadCount > 0;

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
            <Icon name={tab.icon} size={22} color={color} />
            <Text variant="caption" style={[styles.label, { color }]}>
              {tab.label}
            </Text>
            {route.name === 'notifications' && showBadge ? (
              <View style={styles.badge}>
                <Text variant="caption" tone="inverse" style={styles.badgeLabel}>
                  {unreadCount}
                </Text>
              </View>
            ) : null}
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
  label: { fontSize: 10, lineHeight: 14 },
  badge: {
    position: 'absolute',
    top: -3,
    left: '50%',
    marginLeft: 5,
    minWidth: 16,
    height: 16,
    borderRadius: Radius.pill,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeLabel: { fontSize: 10, lineHeight: 14, fontWeight: '600' },
});
