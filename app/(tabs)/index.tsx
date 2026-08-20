import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Calendar } from '@/components/ui/calendar';
import { Card } from '@/components/ui/card';
import { ControlBox } from '@/components/ui/control-box';
import { Field } from '@/components/ui/field';
import { Screen } from '@/components/ui/screen';
import { ScreenScroll } from '@/components/ui/screen-scroll';
import { SelectField } from '@/components/ui/select-field';
import { Text } from '@/components/ui/text';
import { StayBanner } from '@/components/stay/stay-banner';
import { GUEST_OPTIONS, HOTEL, ROOM_TYPES, RoomType } from '@/constants/hotel';
import { Spacing } from '@/constants/theme';
import { BOOKING_MONTH_LABEL, formatDay } from '@/lib/format';
import { useActiveStay } from '@/lib/queries/reservations';
import { useAppStore } from '@/store/app-store';

/** Nombre de nuits appliqué par défaut quand l'arrivée dépasse le départ. */
const DEFAULT_STAY_LENGTH = 3;

type CalendarTarget = 'arrival' | 'departure';

const ROOM_TYPE_OPTIONS = ROOM_TYPES.map((type) => ({ value: type, label: type }));

export default function AccueilScreen() {
  const { state, actions } = useAppStore();
  const { arrival, departure, roomType, guests } = state.search;
  const { query: stayQuery } = useActiveStay();
  const stay = stayQuery.data;

  const [calendarTarget, setCalendarTarget] = useState<CalendarTarget | null>(null);
  const [dateError, setDateError] = useState('');

  const selectDay = (day: number) => {
    if (calendarTarget === 'arrival') {
      actions.setDates(day, day >= departure ? day + DEFAULT_STAY_LENGTH : departure);
      setDateError('');
    } else if (day <= arrival) {
      setDateError("La date de départ doit suivre la date d'arrivée.");
    } else {
      actions.setDates(arrival, day);
      setDateError('');
    }
    setCalendarTarget(null);
  };

  return (
    <Screen>
      <ScreenScroll withTabBar paddingTop={Spacing['2xl']}>
        {stay ? (
          <StayBanner
            label={`${stay.chambre.type_chambre} · ${stay.dateArrivee}`}
            onPress={() => router.push('/(tabs)/sejour')}
          />
        ) : null}

        <Text variant="title" style={[styles.title, stay && styles.titleWithBanner]}>
          Trouvez votre chambre
        </Text>
        <Text variant="body" tone="muted" style={styles.subtitle}>
          {HOTEL.name} · {HOTEL.city}
        </Text>

        <Card style={styles.form} elevated>
          <View style={styles.dates}>
            <Field label="Arrivée" icon="calendar" style={styles.dateField}>
              <ControlBox
                value={formatDay(arrival)}
                accessibilityLabel="Choisir la date d'arrivée"
                onPress={() => setCalendarTarget('arrival')}
              />
            </Field>
            <Field label="Départ" icon="calendar" style={styles.dateField}>
              <ControlBox
                value={formatDay(departure)}
                accessibilityLabel="Choisir la date de départ"
                onPress={() => setCalendarTarget('departure')}
              />
            </Field>
          </View>

          {dateError ? (
            <Text variant="caption" tone="destructive">
              {dateError}
            </Text>
          ) : null}

          <SelectField
            label="Type de chambre"
            icon="bed"
            value={roomType}
            options={ROOM_TYPE_OPTIONS}
            onChange={(value) => actions.setRoomType(value as RoomType)}
          />

          <SelectField
            label="Voyageurs"
            icon="guests"
            value={guests}
            options={GUEST_OPTIONS}
            onChange={actions.setGuests}
          />

          <Button label="Rechercher" icon="search" onPress={() => router.push('/resultats')} />
        </Card>

        <Text variant="caption" tone="subtle" style={styles.notice}>
          {HOTEL.cancellationNotice}
        </Text>
      </ScreenScroll>

      <BottomSheet
        visible={calendarTarget !== null}
        onClose={() => setCalendarTarget(null)}
        title={calendarTarget === 'departure' ? 'Date de départ' : "Date d'arrivée"}
        titleAccessory={
          <Text variant="bodySm" tone="muted">
            {BOOKING_MONTH_LABEL}
          </Text>
        }>
        <Calendar arrival={arrival} departure={departure} onSelectDay={selectDay} />
      </BottomSheet>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 32, lineHeight: 37 },
  titleWithBanner: { marginTop: 22 },
  subtitle: { marginTop: Spacing.sm },
  form: { marginTop: Spacing.xl, gap: Spacing.md + 2, padding: Spacing.lg + 2 },
  dates: { flexDirection: 'row', gap: Spacing.sm + 2 },
  dateField: { flex: 1 },
  notice: { marginTop: Spacing.lg },
});
