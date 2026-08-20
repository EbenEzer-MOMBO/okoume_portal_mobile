import { Image } from 'expo-image';
import { Pressable, StyleSheet, View } from 'react-native';

import { Card } from '@/components/ui/card';
import { PhotoPlaceholder } from '@/components/ui/photo-placeholder';
import { Text } from '@/components/ui/text';
import { ChambreDisponible } from '@/lib/api/types';
import { Spacing } from '@/constants/theme';
import { formatAmount } from '@/lib/format';

export type RoomCardProps = {
  room: ChambreDisponible;
  onPress: () => void;
};

export function RoomCard({ room, onPress }: RoomCardProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${room.type_chambre}, ${formatAmount(room.tarif_nuit)} par nuit`}
      onPress={onPress}
      style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}>
      <Card padded={false} elevated>
        {room.photo_url ? (
          <Image source={{ uri: room.photo_url }} style={styles.photo} contentFit="cover" transition={150} />
        ) : (
          <PhotoPlaceholder style={styles.photo}>
            <Text variant="mono" tone="accent" style={styles.slot}>
              chambre {room.numero}
            </Text>
          </PhotoPlaceholder>
        )}

        <View style={styles.body}>
          <View style={styles.titleRow}>
            <Text variant="cardTitle" style={styles.name}>
              {room.type_chambre}
            </Text>
            <Text variant="price" tone="accent" style={styles.price}>
              {formatAmount(room.tarif_nuit)}
            </Text>
          </View>
          <Text variant="bodySm" tone="muted">
            Chambre {room.numero} · {room.capacite} personnes
          </Text>
          {room.amenites.length > 0 ? (
            <Text variant="caption" tone="subtle">
              {room.amenites.slice(0, 3).join(' · ')}
            </Text>
          ) : null}
        </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  photo: { height: 150 },
  slot: { fontSize: 11 },
  body: { padding: Spacing.lg - 1, paddingTop: Spacing.md + 2, gap: Spacing.sm - 1 },
  titleRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: Spacing.sm + 2 },
  name: { flexShrink: 1 },
  price: { fontSize: 17 },
});
