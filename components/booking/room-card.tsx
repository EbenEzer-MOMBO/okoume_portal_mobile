import { Image } from 'expo-image';
import { Pressable, StyleSheet, View } from 'react-native';

import { Card } from '@/components/ui/card';
import { PhotoPlaceholder } from '@/components/ui/photo-placeholder';
import { Text } from '@/components/ui/text';
import { ChambreDisponible } from '@/lib/api/types';
import { Colors, Spacing } from '@/constants/theme';
import { formatAmount } from '@/lib/format';

export type RoomCardProps = {
  room: ChambreDisponible;
  onPress: () => void;
};

function RoomCardMedia({ photos, roomNumero }: { photos: string[]; roomNumero: string }) {
  if (photos.length === 0) {
    return (
      <PhotoPlaceholder style={styles.photoContainer}>
        <Text variant="mono" tone="accent" style={styles.slot}>
          chambre {roomNumero}
        </Text>
      </PhotoPlaceholder>
    );
  }

  if (photos.length === 1) {
    return (
      <View style={styles.photoContainer}>
        <Image source={{ uri: photos[0] }} style={styles.fullPhoto} contentFit="cover" transition={150} />
      </View>
    );
  }

  if (photos.length === 2) {
    return (
      <View style={[styles.photoContainer, styles.gridRow]}>
        <Image source={{ uri: photos[0] }} style={styles.gridHalf} contentFit="cover" transition={150} />
        <View style={styles.gridGap} />
        <Image source={{ uri: photos[1] }} style={styles.gridHalf} contentFit="cover" transition={150} />
      </View>
    );
  }

  // 3 photos ou plus
  const mainPhoto = photos[0];
  const secondPhoto = photos[1];
  const thirdPhoto = photos[2];
  const extraCount = photos.length - 3;

  return (
    <View style={[styles.photoContainer, styles.gridRow]}>
      {/* Photo principale gauche (50%) */}
      <Image source={{ uri: mainPhoto }} style={styles.gridHalf} contentFit="cover" transition={150} />
      <View style={styles.gridGap} />

      {/* Colonne droite (50%) avec 2 photos empilées */}
      <View style={styles.rightCol}>
        <Image source={{ uri: secondPhoto }} style={styles.gridQuarter} contentFit="cover" transition={150} />
        <View style={styles.gridGapVert} />
        <View style={styles.quarterWrapper}>
          <Image source={{ uri: thirdPhoto }} style={styles.gridQuarter} contentFit="cover" transition={150} />
          {extraCount > 0 && (
            <View style={styles.moreOverlay}>
              <Text style={styles.moreText}>+{extraCount}</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

export function RoomCard({ room, onPress }: RoomCardProps) {
  const photos = room.photos && room.photos.length > 0
    ? room.photos
    : room.photo_url
    ? [room.photo_url]
    : [];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${room.type_chambre}, ${formatAmount(room.tarif_nuit)} par nuit`}
      onPress={onPress}
      style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}>
      <Card padded={false}>
        <RoomCardMedia photos={photos} roomNumero={room.numero} />

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
          {room.amenites && room.amenites.length > 0 ? (
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
  photoContainer: {
    height: 180,
    width: '100%',
    backgroundColor: Colors.backgroundAlt,
    overflow: 'hidden',
  },
  fullPhoto: {
    width: '100%',
    height: '100%',
  },
  gridRow: {
    flexDirection: 'row',
  },
  gridHalf: {
    flex: 1,
    height: '100%',
  },
  gridGap: {
    width: 2,
    backgroundColor: Colors.background,
  },
  gridGapVert: {
    height: 2,
    backgroundColor: Colors.background,
  },
  rightCol: {
    flex: 1,
    height: '100%',
    flexDirection: 'column',
  },
  gridQuarter: {
    width: '100%',
    flex: 1,
  },
  quarterWrapper: {
    flex: 1,
    width: '100%',
    position: 'relative',
  },
  moreOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(28, 27, 25, 0.65)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  slot: { fontSize: 11 },
  body: { padding: Spacing.lg - 1, paddingTop: Spacing.md + 2, gap: Spacing.sm - 1 },
  titleRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: Spacing.sm + 2 },
  name: { flexShrink: 1 },
  price: { fontSize: 17 },
});
