import { Pressable, StyleSheet, View } from 'react-native';

import { Card } from '@/components/ui/card';
import { PhotoPlaceholder } from '@/components/ui/photo-placeholder';
import { Text } from '@/components/ui/text';
import { Room } from '@/constants/hotel';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { formatAmount } from '@/lib/format';

export type RoomCardProps = {
  room: Room;
  onPress: () => void;
};

export function RoomCard({ room, onPress }: RoomCardProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${room.name}, ${formatAmount(room.price)} par nuit`}
      onPress={onPress}
      style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}>
      <Card padded={false} elevated>
        <PhotoPlaceholder style={styles.photo}>
          <Text variant="mono" tone="accent" style={styles.slot}>
            photo — {room.name.toLowerCase()}
          </Text>
          {room.lowStock ? (
            <View style={styles.lowStock}>
              <Text variant="caption" tone="inverse" style={styles.lowStockLabel}>
                Dernières chambres
              </Text>
            </View>
          ) : null}
        </PhotoPlaceholder>

        <View style={styles.body}>
          <View style={styles.titleRow}>
            <Text variant="cardTitle" style={styles.name}>
              {room.name}
            </Text>
            <Text variant="price" tone="accent" style={styles.price}>
              {formatAmount(room.price)}
            </Text>
          </View>
          <Text variant="bodySm" tone="muted">
            {room.capacity} personnes · {room.size} · {room.view}
          </Text>
          <Text variant="caption" tone="subtle">
            {room.amenities.slice(0, 3).join(' · ')}
          </Text>
        </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  photo: { height: 150 },
  slot: { fontSize: 11 },
  lowStock: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: Colors.ink,
    borderRadius: Radius.sm,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  lowStockLabel: { fontSize: 11, lineHeight: 15, fontWeight: '500' },
  body: { padding: Spacing.lg - 1, paddingTop: Spacing.md + 2, gap: Spacing.sm - 1 },
  titleRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: Spacing.sm + 2 },
  name: { flexShrink: 1 },
  price: { fontSize: 17 },
});
