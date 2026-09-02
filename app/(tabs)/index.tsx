import { router } from "expo-router";
import { Image } from "expo-image";
import { StyleSheet, View } from "react-native";

import { MobileSearchWidget } from "@/components/booking/mobile-search-widget";
import { RoomCard } from "@/components/booking/room-card";
import { Button } from "@/components/ui/button";
import { Screen } from "@/components/ui/screen";
import { ScreenScroll } from "@/components/ui/screen-scroll";
import { RoomCardSkeleton } from "@/components/ui/skeleton";
import { Text } from "@/components/ui/text";
import { HOTEL } from "@/constants/hotel";
import { Colors, FontFamily, Spacing } from "@/constants/theme";
import { useAllRooms } from "@/lib/queries/rooms";
import { useAppStore } from "@/store/app-store";

export default function AccueilScreen() {
  const { actions } = useAppStore();
  const roomsQuery = useAllRooms();
  const rooms = roomsQuery.data ?? [];

  const openRoom = (roomId: number) => {
    const room = rooms.find((r) => r.id === roomId);
    if (room) {
      actions.selectRoom(room as any);
      router.push(`/chambre/${roomId}` as any);
    }
  };

  return (
    <Screen>
      <ScreenScroll withTabBar paddingTop={Spacing.md}>
        {/* Conteneur Hero complet positionné vers le bas */}
        <View style={styles.heroBox}>
          <Image
            source={require("@/assets/images/hero.jpg")}
            style={StyleSheet.absoluteFillObject}
            contentFit="cover"
            contentPosition="bottom center"
          />
          <View style={styles.heroOverlay} />

          <View style={styles.heroContent}>
            <Text style={styles.heroOverline}>
              {HOTEL.name} · {HOTEL.city}
            </Text>
            <Text style={styles.heroTitle}>
              Trouvez votre chambre
            </Text>

            <View style={styles.formContainer}>
              <MobileSearchWidget />
            </View>
          </View>
        </View>

        {roomsQuery.isLoading ? (
          <View style={styles.catalogSection}>
            <View style={styles.catalogList}>
              <RoomCardSkeleton />
              <RoomCardSkeleton />
            </View>
          </View>
        ) : rooms.length > 0 ? (
          <View style={styles.catalogSection}>
            <View style={styles.catalogList}>
              {rooms.slice(0, 5).map((room) => (
                <RoomCard
                  key={room.id}
                  room={room as any}
                  onPress={() => openRoom(room.id)}
                />
              ))}
            </View>
            <Button
              label="Voir toutes nos chambres"
              variant="outline"
              onPress={() => router.push('/chambres-catalogue' as any)}
              style={styles.catalogButton}
            />
          </View>
        ) : null}
      </ScreenScroll>
    </Screen>
  );
}

const styles = StyleSheet.create({
  heroBox: {
    width: "100%",
    minHeight: 290,
    position: "relative",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: "flex-end",
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(28, 27, 25, 0.4)",
  },
  heroContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.lg,
    alignItems: "center",
    justifyContent: "flex-end",
  },
  heroOverline: {
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 2,
    color: "#E5E1D8",
    textAlign: "center",
    marginBottom: 4,
  },
  heroTitle: {
    fontSize: 22,
    lineHeight: 27,
    fontFamily: FontFamily.serif,
    textAlign: "center",
    color: "#FFFFFF",
    marginBottom: Spacing.sm + 2,
  },
  formContainer: {
    width: "100%",
  },
  catalogSection: {
    marginTop: Spacing["2xl"],
    paddingBottom: Spacing.xl,
  },
  catalogList: {
    gap: Spacing.xl,
  },
  catalogButton: {
    marginTop: Spacing.xl,
  },
});
