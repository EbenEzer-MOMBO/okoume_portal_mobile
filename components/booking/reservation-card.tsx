import { Pressable, StyleSheet, View } from 'react-native';

import { Badge, type BadgeTone } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { PhotoPlaceholder } from '@/components/ui/photo-placeholder';
import { Text } from '@/components/ui/text';
import { Colors, Radius, Spacing } from '@/constants/theme';

export type ReservationCardProps = {
  roomName: string;
  dates: string;
  status: { label: string; tone: BadgeTone };
  onPress: () => void;
};

/** Ligne de l'historique des réservations. */
export function ReservationCard({ roomName, dates, status, onPress }: ReservationCardProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${roomName}, ${dates}, ${status.label}`}
      onPress={onPress}
      style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}>
      <Card style={styles.card}>
        <PhotoPlaceholder style={styles.thumbnail} />
        <View style={styles.body}>
          <Text variant="cardTitle" style={styles.name}>
            {roomName}
          </Text>
          <Text variant="bodySm" tone="muted">
            {dates}
          </Text>
          <Badge label={status.label} tone={status.tone} />
        </View>
        <Icon name="chevron" size={18} color={Colors.textSubtle} />
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md + 1, padding: Spacing.lg - 1 },
  thumbnail: { width: 52, height: 52, borderRadius: Radius.sm },
  body: { flex: 1, gap: Spacing.xs + 1 },
  name: { fontSize: 15 },
});
