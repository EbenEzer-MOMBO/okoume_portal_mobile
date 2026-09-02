import { Pressable, StyleSheet, View } from 'react-native';

import { SelectField } from '@/components/ui/select-field';
import { Text } from '@/components/ui/text';
import { TextInputField } from '@/components/ui/text-input-field';
import { Colors, Spacing } from '@/constants/theme';
import { ReservationDetail } from '@/lib/api/types';

export type OrderType = 'emporter' | 'livraison' | 'en_chambre';

type Props = {
  typeCommande: OrderType;
  setTypeCommande: (v: OrderType) => void;
  adresseLivraison: string;
  setAdresseLivraison: (v: string) => void;
  reservationId: string;
  setReservationId: (v: string) => void;
  activeReservations: ReservationDetail[];
};

export function CheckoutOrderType({
  typeCommande,
  setTypeCommande,
  adresseLivraison,
  setAdresseLivraison,
  reservationId,
  setReservationId,
  activeReservations,
}: Props) {
  return (
    <>
      <View style={styles.radioGroup}>
        <TypeButton label="À emporter" desc="Retrait resto" active={typeCommande === 'emporter'} onPress={() => setTypeCommande('emporter')} />
        <TypeButton label="Livraison" desc="Livré chez vous" active={typeCommande === 'livraison'} onPress={() => setTypeCommande('livraison')} />
        {activeReservations.length > 0 && (
          <TypeButton label="En chambre" desc="Service d'étage" active={typeCommande === 'en_chambre'} onPress={() => setTypeCommande('en_chambre')} />
        )}
      </View>

      {typeCommande === 'livraison' && (
        <View style={styles.conditional}>
          <TextInputField
            label="Adresse de livraison *"
            value={adresseLivraison}
            onChangeText={setAdresseLivraison}
            placeholder="Rue, quartier, repères visuels..."
          />
        </View>
      )}

      {typeCommande === 'en_chambre' && activeReservations.length > 0 && (
        <View style={styles.conditional}>
          <SelectField
            label="Sélectionnez votre chambre *"
            value={reservationId}
            onChange={setReservationId}
            options={activeReservations.map((res) => ({
              value: String(res.id),
              label: `Chambre ${res.chambre?.numero} (Rés. #${res.reference})`
            }))}
          />
        </View>
      )}
    </>
  );
}

function TypeButton({ label, desc, active, onPress }: { label: string; desc: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable style={[styles.radioButton, active && styles.radioButtonActive]} onPress={onPress}>
      <Text style={[styles.radioLabel, active && styles.radioLabelActive]}>{label}</Text>
      <Text style={styles.radioDesc}>{desc}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  radioGroup: { flexDirection: 'row', gap: Spacing.sm },
  radioButton: {
    flex: 1,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
  },
  radioButtonActive: { borderColor: Colors.accent, backgroundColor: Colors.backgroundMuted },
  radioLabel: { fontSize: 12, fontWeight: '600', color: Colors.text },
  radioLabelActive: { color: Colors.accent },
  radioDesc: { fontSize: 9, color: Colors.textMuted, textTransform: 'uppercase', marginTop: 2 },
  conditional: { marginTop: Spacing.md },
});
