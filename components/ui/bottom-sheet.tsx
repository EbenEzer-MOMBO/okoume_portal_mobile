import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@/components/ui/text';
import { Colors, Radius, Spacing } from '@/constants/theme';

export type BottomSheetProps = {
  visible: boolean;
  onClose: () => void;
  title: string;
  /** Contenu additionnel aligné à droite du titre. */
  titleAccessory?: React.ReactNode;
  children: React.ReactNode;
};

/** Feuille ancrée en bas d'écran (calendrier, filtres, sélecteurs). */
export function BottomSheet({ visible, onClose, title, titleAccessory, children }: BottomSheetProps) {
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.root}>
        <Pressable accessibilityLabel="Fermer" style={styles.overlay} onPress={onClose} />
        <View style={[styles.sheet, { paddingBottom: Spacing.xl + insets.bottom }]}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <Text variant="heading">{title}</Text>
            {titleAccessory}
          </View>
          {children}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: Colors.overlay },
  sheet: {
    maxHeight: '90%',
    backgroundColor: Colors.surface,
    borderTopLeftRadius: Radius.sheet,
    borderTopRightRadius: Radius.sheet,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg + 2,
  },
  handle: {
    width: 38,
    height: 4,
    borderRadius: Radius.pill,
    backgroundColor: Colors.border,
    alignSelf: 'center',
    marginBottom: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg - 2,
  },
});
