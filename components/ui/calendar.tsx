import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/text';
import { Colors, Radius } from '@/constants/theme';
import { BOOKING_MONTH_DAYS, FIRST_SELECTABLE_DAY, MONTH_START_OFFSET } from '@/lib/format';

const WEEK_DAYS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

export type CalendarProps = {
  arrival: number;
  departure: number;
  onSelectDay: (day: number) => void;
};

/** Grille mensuelle : bornes du séjour en plein, nuits intermédiaires teintées. */
export function Calendar({ arrival, departure, onSelectDay }: CalendarProps) {
  return (
    <View>
      <View style={styles.grid}>
        {WEEK_DAYS.map((day, index) => (
          <View key={`${day}-${index}`} style={styles.cell}>
            <Text variant="caption" tone="subtle" style={styles.weekDay}>
              {day}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.grid}>
        {Array.from({ length: MONTH_START_OFFSET }).map((_, index) => (
          <View key={`blank-${index}`} style={styles.cell} />
        ))}

        {Array.from({ length: BOOKING_MONTH_DAYS }).map((_, index) => {
          const day = index + 1;
          const isBound = day === arrival || day === departure;
          const isInRange = day > arrival && day < departure;
          const isPast = day < FIRST_SELECTABLE_DAY;

          return (
            <View key={day} style={styles.cell}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`${day} septembre 2026`}
                accessibilityState={{ selected: isBound, disabled: isPast }}
                disabled={isPast}
                onPress={() => onSelectDay(day)}
                style={[
                  styles.day,
                  isBound && styles.dayBound,
                  isInRange && styles.dayInRange,
                ]}>
                <Text
                  variant="body"
                  style={{ color: isBound ? Colors.onInk : isPast ? Colors.textDisabled : Colors.text }}>
                  {day}
                </Text>
              </Pressable>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: `${100 / 7}%`, padding: 2 },
  weekDay: { textAlign: 'center', paddingVertical: 4 },
  day: { height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: Radius.md },
  dayBound: { backgroundColor: Colors.ink },
  dayInRange: { backgroundColor: Colors.backgroundMuted },
});
