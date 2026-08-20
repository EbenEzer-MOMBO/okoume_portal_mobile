import { Linking, Platform, Pressable, StyleSheet, View } from 'react-native';

import { Card } from '@/components/ui/card';
import { Divider } from '@/components/ui/divider';
import { Icon, type IconName } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { HOTEL } from '@/constants/hotel';
import { Colors, Spacing } from '@/constants/theme';

function openMap() {
  const query = encodeURIComponent(`${HOTEL.name}, ${HOTEL.address}`);
  const url = Platform.select({
    ios: `maps://?q=${query}`,
    android: `geo:0,0?q=${query}`,
    default: `https://maps.google.com/?q=${query}`,
  });
  Linking.openURL(url);
}

function ContactRow({
  icon,
  children,
  onPress,
  accessibilityLabel,
}: {
  icon: IconName;
  children: React.ReactNode;
  onPress?: () => void;
  accessibilityLabel?: string;
}) {
  const content = (
    <View style={styles.row}>
      <Icon name={icon} size={17} color={Colors.accent} style={styles.icon} />
      <View style={styles.rowBody}>{children}</View>
    </View>
  );

  if (!onPress) return content;

  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}>
      {content}
    </Pressable>
  );
}

/** Coordonnées de l'hôtel : adresse, téléphone, ouverture dans le plan. */
export function HotelContactCard() {
  return (
    <Card style={styles.card}>
      <ContactRow icon="location">
        <Text variant="body">{HOTEL.name}</Text>
        <Text variant="body" tone="muted">
          {HOTEL.address}
        </Text>
      </ContactRow>
      <Divider />
      <ContactRow
        icon="phone"
        accessibilityLabel={`Appeler ${HOTEL.name}`}
        onPress={() => Linking.openURL(`tel:${HOTEL.phone.replace(/\s/g, '')}`)}>
        <Text variant="body">{HOTEL.phone}</Text>
      </ContactRow>
      <Divider />
      <ContactRow icon="map" accessibilityLabel="Ouvrir dans le plan" onPress={openMap}>
        <Text variant="body" tone="accent">
          Ouvrir dans le plan
        </Text>
      </ContactRow>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: Spacing.md + 1 },
  row: { flexDirection: 'row', gap: Spacing.md - 1 },
  rowBody: { flex: 1, gap: 2 },
  icon: { marginTop: 1 },
});
