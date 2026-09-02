import { Pressable, StyleSheet, View } from 'react-native';
import { useEffect, useState } from 'react';

import { Text } from '@/components/ui/text';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { Icon } from '@/components/ui/icon';
import { FIRST_SELECTABLE_DAY } from '@/lib/format';

const WEEK_DAYS = ['lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.', 'dim.'];

export type CalendarProps = {
  arrival: number;
  departure: number;
  onSelectDay: (timestamp: number) => void;
  /** Dates ISO YYYY-MM-DD déjà réservées — affichées en rayé et non sélectionnables. */
  disabledDates?: string[];
};

const getValidInitialDate = (timestamp: number) => {
  if (timestamp && timestamp > 0) {
    const d = new Date(timestamp);
    if (!isNaN(d.getTime())) return d;
  }
  return new Date();
};

export function Calendar({ arrival, departure, onSelectDay, disabledDates = [] }: CalendarProps) {
  const [viewDate, setViewDate] = useState(() => getValidInitialDate(arrival));

  useEffect(() => {
    if (arrival && arrival > 0) {
      setViewDate(new Date(arrival));
    }
  }, [arrival]);
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = (new Date(year, month, 1).getDay() + 6) % 7;
  const monthName = viewDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

  const prevMonth = () => {
    setViewDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setViewDate(new Date(year, month + 1, 1));
  };

  const days: (Date | null)[] = [];
  for (let i = 0; i < firstDayIndex; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(year, month, i));
  }

  // Get start of today (local time) to disable past dates
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayTime = today.getTime();

  return (
    <View style={styles.container}>
      {/* Month Pagination Header */}
      <View style={styles.header}>
        <Pressable 
          onPress={prevMonth}
          style={({ pressed }) => [styles.navBtn, pressed && { opacity: 0.6 }]}
        >
          <Icon name="chevron" size={18} color={Colors.ink} style={{ transform: [{ rotate: '180deg' }] }} />
        </Pressable>
        
        <Text variant="cardTitle" style={styles.monthLabel}>
          {monthName}
        </Text>

        <Pressable 
          onPress={nextMonth}
          style={({ pressed }) => [styles.navBtn, pressed && { opacity: 0.6 }]}
        >
          <Icon name="chevron" size={18} color={Colors.ink} />
        </Pressable>
      </View>

      {/* Week days */}
      <View style={styles.grid}>
        {WEEK_DAYS.map((day, index) => (
          <View key={`${day}-${index}`} style={styles.cell}>
            <Text variant="caption" tone="subtle" style={styles.weekDay}>
              {day}
            </Text>
          </View>
        ))}
      </View>

      {/* Days grid */}
      <View style={styles.grid}>
        {days.map((d, index) => {
          if (!d) {
            return <View key={`blank-${index}`} style={styles.cell} />;
          }

          const dayTimestamp = d.getTime();
          const isArrival = dayTimestamp === arrival;
          const isDeparture = dayTimestamp === departure;
          const isBound = isArrival || isDeparture;
          const isInRange = !!(arrival && departure && dayTimestamp > arrival && dayTimestamp < departure);
          
          // Disable past dates and dates before FIRST_SELECTABLE_DAY
          const isPast = dayTimestamp < todayTime || dayTimestamp < FIRST_SELECTABLE_DAY;
          // Check if this date is already booked
          const isoDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
          const isBooked = disabledDates.includes(isoDate);
          const isDisabled = isPast || isBooked;

          return (
            <View key={dayTimestamp} style={styles.cell}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                accessibilityState={{ selected: isBound, disabled: isDisabled }}
                disabled={isDisabled}
                onPress={() => onSelectDay(dayTimestamp)}
                style={[
                  styles.day,
                  isBound && styles.dayBound,
                  isInRange && styles.dayInRange,
                  isBooked && styles.dayBooked,
                ]}>
                <Text
                  variant="body"
                  style={[
                    styles.dayText,
                    isBound && styles.dayTextBound,
                    isPast && styles.dayTextPast,
                    isBooked && styles.dayTextBooked,
                  ]}>
                  {d.getDate()}
                </Text>
              </Pressable>
            </View>
          );
        })}
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendIcon, { backgroundColor: Colors.ink }]} />
          <Text variant="caption" tone="subtle">Sélectionné</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendIcon, { backgroundColor: 'rgba(154, 59, 46, 0.08)' }]}>
            <Text style={{ fontSize: 10, fontWeight: '500', color: 'rgba(154, 59, 46, 0.5)', textDecorationLine: 'line-through' }}>15</Text>
          </View>
          <Text variant="caption" tone="subtle">Non disponible</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={styles.legendIcon}>
            <Text style={{ fontSize: 11, fontWeight: '500', color: Colors.textDisabled }}>15</Text>
          </View>
          <Text variant="caption" tone="subtle">Passé / Bloqué</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: Spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  navBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  monthLabel: {
    textTransform: 'capitalize',
    fontSize: 16,
  },
  grid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap',
  },
  cell: { 
    width: `${100 / 7}%`, 
    padding: 2,
    aspectRatio: 1,
    justifyContent: 'center',
  },
  weekDay: { 
    textAlign: 'center', 
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  day: { 
    flex: 1,
    alignItems: 'center', 
    justifyContent: 'center', 
    borderRadius: Radius.md,
    height: '100%',
  },
  dayBound: { 
    backgroundColor: Colors.ink, 
  },
  dayInRange: { 
    backgroundColor: Colors.backgroundMuted, 
  },
  dayText: {
    color: Colors.text,
  },
  dayTextBound: {
    color: Colors.onInk,
    fontWeight: 'bold',
  },
  dayTextPast: {
    color: Colors.textDisabled,
    textDecorationLine: 'line-through',
  },
  dayBooked: {
    backgroundColor: 'rgba(154, 59, 46, 0.08)',
  },
  dayTextBooked: {
    color: 'rgba(154, 59, 46, 0.5)',
    textDecorationLine: 'line-through',
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    marginTop: Spacing.xl,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  legendIcon: {
    width: 20,
    height: 20,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
