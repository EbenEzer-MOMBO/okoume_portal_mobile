import { Modal, StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Colors, Radius, Spacing } from '@/constants/theme';

export type DialogProps = {
  visible: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel?: string;
  /** `destructive` : action de confirmation en rouge. */
  tone?: 'default' | 'destructive';
  onConfirm: () => void;
  onCancel: () => void;
};

/** Confirmation modale avant une action sensible. */
export function Dialog({
  visible,
  title,
  description,
  confirmLabel,
  cancelLabel = 'Annuler',
  tone = 'default',
  onConfirm,
  onCancel,
}: DialogProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel} statusBarTranslucent>
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          <Text variant="heading" style={styles.title}>
            {title}
          </Text>
          <Text variant="body" tone="muted" style={styles.description}>
            {description}
          </Text>
          <View style={styles.actions}>
            <Button label={cancelLabel} variant="secondary" onPress={onCancel} style={styles.action} />
            <Button
              label={confirmLabel}
              variant={tone === 'destructive' ? 'destructive' : 'primary'}
              onPress={onConfirm}
              style={styles.action}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: Colors.overlayStrong,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  dialog: {
    width: '100%',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.xl + 2,
  },
  title: { fontSize: 19 },
  description: { marginTop: Spacing.sm },
  actions: { flexDirection: 'row', gap: Spacing.sm + 1, marginTop: Spacing.xl },
  action: { flex: 1, height: 44 },
});
