import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Calendar } from "@/components/ui/calendar";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { Colors, Radius, Spacing } from "@/constants/theme";
import { formatDay } from "@/lib/format";
import { useAppStore } from "@/store/app-store";
import { useState } from "react";
import { Platform, Pressable, StyleSheet, UIManager, View } from "react-native";
import { router } from "expo-router";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const DEFAULT_STAY_LENGTH = 3;

export function MobileSearchWidget() {
  const { state, actions } = useAppStore();
  const { arrival, departure, guests, adults = '2', children = '0', roomType } = state.search;

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [calendarTarget, setCalendarTarget] = useState<"arrival" | "departure">("arrival");
  const [dateError, setDateError] = useState("");

  const selectDay = (timestamp: number) => {
    if (!arrival || (arrival && departure)) {
      actions.setDates(timestamp, 0);
      setDateError("");
    } else {
      if (timestamp > arrival) {
        actions.setDates(arrival, timestamp);
        setDateError("");
      } else {
        actions.setDates(timestamp, 0);
        setDateError("");
      }
    }
  };

  const handleSearch = () => {
    setIsSheetOpen(false);
    router.push('/resultats');
  };

  return (
    <View style={styles.container}>
      {/* Widget : Bouton combiné avec bouton d'effacement */}
      <View style={styles.searchBarRow}>
        <Pressable
          style={styles.mainButton}
          onPress={() => setIsSheetOpen(true)}>
          <Text variant="overline" tone="muted" style={styles.label}>
            Période du séjour
          </Text>
          <Text variant="body" style={[styles.value, !departure && styles.valuePlaceholder]}>
            {!departure
              ? 'Choisir une période'
              : `${formatDay(arrival)} — ${formatDay(departure)}`}
          </Text>
        </Pressable>

        {departure ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Effacer les dates"
            onPress={() => actions.setDates(0, 0)}
            style={styles.clearBtn}>
            <Icon name="x" size={18} color={Colors.textMuted} />
          </Pressable>
        ) : null}
      </View>

      <BottomSheet
        visible={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        title=""
      >
        <View style={styles.sheetContent}>
          {dateError ? (
            <Text
              variant="caption"
              tone="destructive"
              style={{ paddingBottom: Spacing.md }}>
              {dateError}
            </Text>
          ) : null}

          {/* Calendrier intégré */}
          <Text variant="cardTitle" style={styles.sectionTitle}>
            Dates du séjour
          </Text>
          <Calendar
            arrival={arrival}
            departure={departure}
            onSelectDay={selectDay}
          />
          
          <View style={styles.divider} />

          {/* Options: Hôtes (Adultes & Enfants) */}
          <View style={styles.optionsFields}>
            {/* Adultes */}
            <View style={styles.guestControl}>
              <Text style={styles.guestLabel}>Adultes</Text>
              <View style={styles.guestCounter}>
                <Pressable
                  onPress={() => actions.setAdults(String(Math.max(1, parseInt(adults) - 1)))}
                  disabled={parseInt(adults) <= 1}
                  style={({ pressed }) => [
                    styles.guestBtn,
                    parseInt(adults) <= 1 && styles.guestBtnDisabled,
                    pressed && { opacity: 0.7 },
                  ]}>
                  <Icon
                    name="minus"
                    size={14}
                    color={parseInt(adults) <= 1 ? Colors.textMuted : Colors.ink}
                  />
                </Pressable>
                <Text style={styles.guestCount}>{adults}</Text>
                <Pressable
                  onPress={() => actions.setAdults(String(parseInt(adults) + 1))}
                  style={({ pressed }) => [styles.guestBtn, pressed && { opacity: 0.7 }]}>
                  <Icon name="plus" size={14} color={Colors.ink} />
                </Pressable>
              </View>
            </View>

            {/* Enfants */}
            <View style={styles.guestControl}>
              <Text style={styles.guestLabel}>Enfants</Text>
              <View style={styles.guestCounter}>
                <Pressable
                  onPress={() => actions.setChildren(String(Math.max(0, parseInt(children) - 1)))}
                  disabled={parseInt(children) <= 0}
                  style={({ pressed }) => [
                    styles.guestBtn,
                    parseInt(children) <= 0 && styles.guestBtnDisabled,
                    pressed && { opacity: 0.7 },
                  ]}>
                  <Icon
                    name="minus"
                    size={14}
                    color={parseInt(children) <= 0 ? Colors.textMuted : Colors.ink}
                  />
                </Pressable>
                <Text style={styles.guestCount}>{children}</Text>
                <Pressable
                  onPress={() => actions.setChildren(String(parseInt(children) + 1))}
                  style={({ pressed }) => [styles.guestBtn, pressed && { opacity: 0.7 }]}>
                  <Icon name="plus" size={14} color={Colors.ink} />
                </Pressable>
              </View>
            </View>
          </View>

          <Button 
            label="Rechercher" 
            onPress={handleSearch} 
            style={styles.searchButton}
          />
        </View>
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.sm,
    overflow: "hidden",
  },
  searchBarRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  mainButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  clearBtn: {
    paddingHorizontal: Spacing.lg,
    alignSelf: "stretch",
    justifyContent: "center",
    alignItems: "center",
  },
  label: {
    fontSize: 10,
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  value: {
    fontSize: 14,
    color: Colors.ink,
  },
  valuePlaceholder: {
    color: Colors.textMuted,
  },
  sheetContent: {
    paddingHorizontal: 0,
    paddingBottom: Spacing.xl,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.lg,
  },
  optionsFields: {
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  guestControl: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  guestLabel: {
    fontSize: 14,
    color: Colors.ink,
  },
  guestCounter: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    gap: Spacing.md,
  },
  guestBtn: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  guestBtnDisabled: {},
  guestCount: {
    width: 16,
    textAlign: "center",
    fontSize: 14,
    color: Colors.ink,
  },
  searchButton: {
    marginTop: Spacing.sm,
  },
});
