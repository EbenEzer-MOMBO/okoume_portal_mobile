import { Pressable, StyleSheet, View } from 'react-native';

import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { Colors, Spacing } from '@/constants/theme';
import { formatDay } from '@/lib/format';

type Props = {
  isOpen: boolean;
  setIsOpen: (v: boolean) => void;
  scheduledDate: number | null;
  setScheduledDate: (v: number | null) => void;
  schedHour: number;
  setSchedHour: (v: number | ((p: number) => number)) => void;
  schedMinute: number;
  setSchedMinute: (v: number | ((p: number) => number)) => void;
};

export function CheckoutScheduler({
  isOpen,
  setIsOpen,
  scheduledDate,
  setScheduledDate,
  schedHour,
  setSchedHour,
  schedMinute,
  setSchedMinute,
}: Props) {
  const timeLabel = scheduledDate
    ? `Planifié le ${formatDay(scheduledDate)} à ${String(schedHour).padStart(2, '0')}:${String(schedMinute).padStart(2, '0')}`
    : 'Préparation immédiate (appuyez pour planifier)';

  return (
    <>
      <View style={styles.header}>
        <Text variant="sectionTitle" style={{ marginBottom: 0 }}>Heure souhaitée (optionnel)</Text>
        {scheduledDate ? (
          <Pressable onPress={() => { setScheduledDate(null); setSchedHour(12); setSchedMinute(0); }}>
            <Text variant="bodySm" tone="destructive">Effacer</Text>
          </Pressable>
        ) : null}
      </View>

      <Pressable style={styles.trigger} onPress={() => setIsOpen(true)}>
        <Icon name="calendar" size={16} color={Colors.textMuted} />
        <Text style={styles.triggerText}>{timeLabel}</Text>
      </Pressable>

      <BottomSheet visible={isOpen} onClose={() => setIsOpen(false)} title="Planifier la préparation">
        <View style={styles.sheetContent}>
          <Calendar
            arrival={scheduledDate || Date.now()}
            departure={0}
            onSelectDay={(ts) => setScheduledDate(ts)}
          />

          <View style={styles.timeSection}>
            <Text style={styles.timeSectionLabel}>Heure de préparation</Text>
            <View style={styles.timeRow}>
              <Counter
                label="Heure"
                value={`${String(schedHour).padStart(2, '0')} h`}
                onDecrement={() => setSchedHour((h) => Math.max(8, h - 1))}
                onIncrement={() => setSchedHour((h) => Math.min(22, h + 1))}
              />
              <Counter
                label="Minute"
                value={`${String(schedMinute).padStart(2, '0')} m`}
                onDecrement={() => setSchedMinute((m) => Math.max(0, m - 15))}
                onIncrement={() => setSchedMinute((m) => Math.min(45, m + 15))}
              />
            </View>
          </View>

          <Button
            label="Valider la planification"
            onPress={() => {
              if (!scheduledDate) setScheduledDate(Date.now());
              setIsOpen(false);
            }}
            style={{ marginTop: Spacing.xl }}
          />
        </View>
      </BottomSheet>
    </>
  );
}

function Counter({ label, value, onDecrement, onIncrement }: { label: string; value: string; onDecrement: () => void; onIncrement: () => void }) {
  return (
    <View style={styles.counterBox}>
      <Text style={styles.counterLabel}>{label}</Text>
      <View style={styles.counterRow}>
        <Pressable onPress={onDecrement} style={styles.counterBtn}>
          <Text style={styles.counterBtnText}>-</Text>
        </Pressable>
        <Text style={styles.counterValue}>{value}</Text>
        <Pressable onPress={onIncrement} style={styles.counterBtn}>
          <Text style={styles.counterBtnText}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    backgroundColor: Colors.background,
    borderRadius: 8,
  },
  triggerText: { fontSize: 13, color: Colors.text },
  sheetContent: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xl },
  timeSection: { marginTop: Spacing.lg, gap: Spacing.sm },
  timeSectionLabel: { fontSize: 14, fontWeight: '700', color: Colors.ink },
  timeRow: { flexDirection: 'row', gap: Spacing.lg },
  counterBox: { flex: 1, gap: Spacing.xs },
  counterLabel: { fontSize: 11, color: Colors.textMuted, textTransform: 'uppercase' },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    justifyContent: 'space-between',
    borderRadius: 8,
  },
  counterBtn: { width: 24, height: 24, justifyContent: 'center', alignItems: 'center' },
  counterBtnText: { fontSize: 18, fontWeight: 'bold', color: Colors.ink },
  counterValue: { fontSize: 14, fontWeight: '600', color: Colors.ink },
});
