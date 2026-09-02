import { Image } from 'expo-image';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { TextInputField } from '@/components/ui/text-input-field';
import { Colors, Spacing } from '@/constants/theme';
import { SyncStatusResponse } from '@/lib/api/types';
import { useSyncStatus } from '@/lib/queries/sync';
import { OrderType } from './checkout-order-type';

export type PaymentMode = 'airtel_money' | 'moov_money' | 'clickpay' | 'sur_chambre';

type Props = {
  typeCommande: OrderType;
  modePaiement: PaymentMode;
  setModePaiement: (v: PaymentMode) => void;
  numeroMobileMoney: string;
  setNumeroMobileMoney: (v: string) => void;
  isSubmitting?: boolean;
};

const PAY_IMAGES = {
  airtel_money: require('@/assets/images/airtel_money.png'),
  moov_money: require('@/assets/images/moov_money.png'),
  visa: require('@/assets/images/visa.png'),
  clikpay: require('@/assets/images/clikpay-logo.png'),
};

function SyncBadge({ data, forceOnline }: { data?: SyncStatusResponse; forceOnline?: boolean }) {
  const isOnline = forceOnline || (data?.isOnline ?? false);

  return (
    <View style={styles.syncCard}>
      <View style={styles.syncStatusDot}>
        <View style={[styles.dot, { backgroundColor: isOnline ? Colors.success : Colors.destructive }]} />
        <Text variant="bodySm" style={{ fontWeight: '600', color: isOnline ? Colors.success : Colors.destructive }}>
          {isOnline ? 'Serveur en ligne' : 'Serveur hors ligne'}
        </Text>
      </View>
    </View>
  );
}

export function CheckoutPayment({
  typeCommande,
  modePaiement,
  setModePaiement,
  numeroMobileMoney,
  setNumeroMobileMoney,
  isSubmitting = false,
}: Props) {
  const syncStatus = useSyncStatus();
  const isMobileMoney = modePaiement === 'airtel_money' || modePaiement === 'moov_money';

  if (typeCommande === 'en_chambre') {
    return (
      <View style={styles.roomBilling}>
        <Text style={styles.roomBillingTitle}>Facturer sur la chambre</Text>
        <Text style={styles.roomBillingDesc}>
          Le montant sera automatiquement reporté sur la note globale de votre séjour.
        </Text>
      </View>
    );
  }

  if (syncStatus.isLoading && !isSubmitting) {
    return (
      <View style={styles.networkBox}>
        <ActivityIndicator size="small" color={Colors.accent} />
        <Text variant="bodySm" tone="muted">Vérification du service de paiement…</Text>
      </View>
    );
  }

  const isServerOnline = isSubmitting || (syncStatus.data?.isOnline ?? false);

  if (!isServerOnline) {
    return (
      <>
        <SyncBadge data={syncStatus.data} />
        <View style={styles.offlineBox}>
          <Text variant="bodySm" tone="destructive" style={{ textAlign: 'center' }}>
            Le serveur est injoignable — aucune commande ne peut être passée.
          </Text>
          <Button
            label="Vérifier la connexion"
            variant="outline"
            onPress={() => syncStatus.refetch()}
            loading={syncStatus.isRefetching}
            style={{ marginTop: Spacing.sm }}
          />
        </View>
      </>
    );
  }

  return (
    <>
      <SyncBadge data={syncStatus.data} forceOnline={isSubmitting} />

      <View style={[styles.methods, { marginTop: Spacing.xs }]}>
        <PayBtn label="Airtel Money" image={PAY_IMAGES.airtel_money} active={modePaiement === 'airtel_money'} onPress={() => setModePaiement('airtel_money')} />
        <PayBtn label="Moov Money" image={PAY_IMAGES.moov_money} active={modePaiement === 'moov_money'} onPress={() => setModePaiement('moov_money')} />
        <DisabledPayBtn label="Clikpay" image={PAY_IMAGES.clikpay} />
        <DisabledPayBtn label="Visa / Card" image={PAY_IMAGES.visa} />
      </View>

      {isMobileMoney && (
        <View style={{ marginTop: Spacing.md }}>
          <TextInputField
            label="Numéro Mobile Money (Gabon) *"
            value={numeroMobileMoney}
            onChangeText={setNumeroMobileMoney}
            placeholder="Ex: 077 00 00 00"
            keyboardType="phone-pad"
          />
        </View>
      )}
    </>
  );
}

function PayBtn({ label, image, active, onPress }: { label: string; image?: any; active: boolean; onPress: () => void }) {
  return (
    <Pressable style={[styles.btn, active && styles.btnActive]} onPress={onPress}>
      {image ? <Image source={image} style={styles.logo} contentFit="contain" /> : <View style={styles.logoPlaceholder} />}
      <Text style={[styles.btnLabel, active && styles.btnLabelActive]}>{label}</Text>
    </Pressable>
  );
}

function DisabledPayBtn({ label, image }: { label: string; image?: any }) {
  return (
    <View style={[styles.btn, styles.btnDisabled]}>
      {image ? <Image source={image} style={[styles.logo, { opacity: 0.5 }]} contentFit="contain" /> : <View style={styles.logoPlaceholder} />}
      <Text style={styles.btnLabelDisabled}>{label}</Text>
      <Text style={styles.badge}>Bientôt</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  syncCard: {
    paddingVertical: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  syncStatusDot: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  offlineBox: {
    padding: Spacing.md,
    gap: Spacing.sm,
    alignItems: 'center',
  },
  methods: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  btn: {
    width: '48%',
    padding: Spacing.sm,
    backgroundColor: Colors.backgroundAlt,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    gap: 4,
  },
  btnActive: { backgroundColor: Colors.backgroundMuted, borderColor: Colors.accent },
  btnDisabled: { opacity: 0.5, backgroundColor: Colors.surface },
  logo: { width: 40, height: 40 },
  logoPlaceholder: { width: 40, height: 40, backgroundColor: Colors.border, borderRadius: 20 },
  btnLabel: { fontSize: 11, fontWeight: '600', color: Colors.text, textAlign: 'center' },
  btnLabelActive: { color: Colors.accent },
  btnLabelDisabled: { fontSize: 11, color: Colors.textDisabled, textAlign: 'center' },
  badge: { fontSize: 8, color: Colors.textMuted, textTransform: 'uppercase', fontWeight: 'bold' },
  roomBilling: { padding: Spacing.md, backgroundColor: Colors.backgroundAlt, borderWidth: 1, borderColor: Colors.border },
  roomBillingTitle: { fontSize: 14, fontWeight: '600', color: Colors.ink },
  roomBillingDesc: { fontSize: 12, color: Colors.textMuted, marginTop: 4 },
  networkBox: { padding: Spacing.md, gap: Spacing.sm, alignItems: 'center', justifyContent: 'center' },
});
