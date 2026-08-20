import { Pressable, StyleSheet, View } from 'react-native';

import { Icon, type IconName } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { AppNotification, NotificationKind } from '@/store/app-store';
import { Colors, Radius, Spacing } from '@/constants/theme';

const KIND_ICONS: Record<NotificationKind, IconName> = {
  confirm: 'check',
  clock: 'clock',
  promo: 'promo',
};

export type NotificationItemProps = {
  notification: AppNotification;
  onPress: () => void;
};

export function NotificationItem({ notification, onPress }: NotificationItemProps) {
  const { unread, title, body, time, kind } = notification;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${title}${unread ? ', non lue' : ''}`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.item,
        { backgroundColor: unread ? Colors.unreadBg : Colors.surface, opacity: pressed ? 0.9 : 1 },
      ]}>
      <View style={[styles.icon, { backgroundColor: unread ? Colors.unreadIconBg : Colors.readIconBg }]}>
        <Icon name={KIND_ICONS[kind]} size={16} color={Colors.accent} />
      </View>

      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Text variant="body" style={styles.title}>
            {title}
          </Text>
          {unread ? <View style={styles.dot} /> : null}
        </View>
        <Text variant="bodySm" tone="muted">
          {body}
        </Text>
        <Text variant="caption" tone="subtle">
          {time}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    padding: Spacing.lg - 1,
  },
  icon: { width: 34, height: 34, borderRadius: Radius.pill, alignItems: 'center', justifyContent: 'center' },
  body: { flex: 1, gap: Spacing.xs },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm - 1 },
  title: { fontWeight: '600' },
  dot: { width: 7, height: 7, borderRadius: Radius.pill, backgroundColor: Colors.accent },
});
