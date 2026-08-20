import { StyleSheet, View } from 'react-native';

import { NotificationItem } from '@/components/notifications/notification-item';
import { EmptyState } from '@/components/ui/empty-state';
import { Screen } from '@/components/ui/screen';
import { ScreenScroll } from '@/components/ui/screen-scroll';
import { Text } from '@/components/ui/text';
import { TextButton } from '@/components/ui/text-button';
import { Spacing } from '@/constants/theme';
import { useAppStore } from '@/store/app-store';

export default function NotificationsScreen() {
  const { state, unreadCount, actions } = useAppStore();
  const notifications = state.notifications;

  return (
    <Screen>
      <ScreenScroll withTabBar paddingTop={Spacing['2xl']}>
        <View style={styles.header}>
          <Text variant="title">Notifications</Text>
          {unreadCount > 0 ? (
            <TextButton label="Tout lire" tone="accent" onPress={actions.readAllNotifications} />
          ) : null}
        </View>

        {notifications.length === 0 ? (
          <EmptyState
            icon="bell"
            title="Rien de neuf"
            description="Vos confirmations et rappels de séjour s'afficheront ici."
            paddingVertical={96}
          />
        ) : (
          <View style={styles.list}>
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onPress={() => actions.readNotification(notification.id)}
              />
            ))}
          </View>
        )}
      </ScreenScroll>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: Spacing.sm + 2 },
  list: { gap: Spacing.sm + 1, marginTop: Spacing.lg + 2 },
});
