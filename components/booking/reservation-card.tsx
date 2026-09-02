import { Image } from "expo-image";
import { StyleSheet, View } from "react-native";

import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { Colors, Spacing } from "@/constants/theme";
import { ReservationDetail } from "@/lib/api/types";
import { dayFromISODate, formatAmount, formatDay } from "@/lib/format";
import { getStatutBadge } from "@/lib/stay";

export type ReservationCardProps = {
  reservation: ReservationDetail;
  isServerOnline: boolean;
  onPay: () => void;
  onPress?: () => void;
  onRetryServer?: () => void;
};

export function ReservationCard({
  reservation,
  isServerOnline,
  onPay,
  onPress,
  onRetryServer,
}: ReservationCardProps) {
  const isPaid =
    reservation.statut === "confirmee" || reservation.statut === "checkin";
  const badgeInfo = getStatutBadge(reservation.statut);

  return (
    <View style={styles.card}>
      {/* En-tête de la carte : Statut & Titre */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text variant="cardTitle" style={styles.roomTitle}>
            {reservation.chambre.type_chambre?.replace(/_/g, " ") || "Chambre"}
            {reservation.chambre.numero ? (
              <Text variant="body" tone="muted">
                {" "}
                — N° {reservation.chambre.numero}
              </Text>
            ) : null}
          </Text>
          <Text variant="caption" tone="muted" style={styles.reference}>
            RÉF. {reservation.reference}
          </Text>
        </View>

        <View style={styles.badgeWrapper}>
          {isPaid ? (
            <View style={styles.paidBadge}>
              <Text style={styles.paidBadgeText}>
                ✓ Payée — Check-in à finaliser
              </Text>
            </View>
          ) : (
            <View style={styles.pendingBadge}>
              <Text style={styles.pendingBadgeText}>Paiement en attente</Text>
            </View>
          )}
        </View>
      </View>

      {/* Contenu : Image + Détails du séjour */}
      <View style={styles.content}>
        {reservation.chambre.photoUrl ? (
          <Image
            source={{ uri: reservation.chambre.photoUrl }}
            style={styles.photo}
            contentFit="cover"
          />
        ) : (
          <View style={styles.photoPlaceholder}>
            <Text
              variant="caption"
              tone="accent"
              style={styles.photoPlaceholderText}>
              YA HÔTEL
            </Text>
          </View>
        )}

        <View style={styles.detailsGrid}>
          <View style={styles.detailItem}>
            <Text variant="caption" tone="muted" style={styles.detailLabel}>
              Arrivée
            </Text>
            <Text variant="body" style={styles.detailValue}>
              {formatDay(dayFromISODate(reservation.dateArrivee))}
            </Text>
          </View>

          <View style={styles.detailItem}>
            <Text variant="caption" tone="muted" style={styles.detailLabel}>
              Départ
            </Text>
            <Text variant="body" style={styles.detailValue}>
              {formatDay(dayFromISODate(reservation.dateDepart))}
            </Text>
          </View>

          <View style={styles.detailItem}>
            <Text variant="caption" tone="muted" style={styles.detailLabel}>
              Durée
            </Text>
            <Text variant="body" style={styles.detailValue}>
              {reservation.nombreNuits
                ? `${reservation.nombreNuits} nuit(s)`
                : "—"}
            </Text>
          </View>

          <View style={styles.detailItem}>
            <Text variant="caption" tone="muted" style={styles.detailLabel}>
              {isPaid ? "Montant Payé" : "Montant Total"}
            </Text>
            <Text
              variant="body"
              style={[styles.detailValue, { fontWeight: "700" }]}>
              {reservation.montantTotal
                ? formatAmount(reservation.montantTotal)
                : "—"}
            </Text>
          </View>
        </View>
      </View>

      {/* Action de paiement si non payée */}
      {!isPaid && (
        <View style={styles.footer}>
          {isServerOnline ? (
            <Button
              label="Procéder au paiement"
              onPress={onPay}
              style={styles.payButton}
            />
          ) : (
            <Button
              label="Tenter à nouveau"
              variant="outline"
              onPress={onRetryServer}
              style={styles.payButton}
            />
          )}
          {!isServerOnline && (
            <Text
              variant="caption"
              tone="destructive"
              style={styles.offlineHint}>
              Le serveur local de l’hôtel n’est pas connecté actuellement.
            </Text>
          )}
        </View>
      )}

      {isPaid && (
        <View style={styles.confirmedFooter}>
          <Text variant="caption" tone="subtle" style={styles.confirmedText}>
            Présentez cette référence lors de votre arrivée.
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 0,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingBottom: Spacing.sm + 2,
  },
  headerLeft: {
    flex: 1,
    gap: 2,
  },
  roomTitle: {
    fontSize: 16,
    textTransform: "capitalize",
  },
  reference: {
    fontFamily: "monospace",
    letterSpacing: 0.5,
  },
  badgeWrapper: {
    alignItems: "flex-end",
  },
  paidBadge: {
    backgroundColor: "#ECFDF5",
    borderWidth: 1,
    borderColor: "#A7F3D0",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 0,
  },
  paidBadgeText: {
    color: "#065F46",
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  pendingBadge: {
    backgroundColor: "#FEF3C7",
    borderWidth: 1,
    borderColor: "#FDE68A",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 0,
  },
  pendingBadgeText: {
    color: "#92400E",
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  content: {
    flexDirection: "row",
    gap: Spacing.md,
    alignItems: "center",
  },
  photo: {
    width: 80,
    height: 80,
    borderRadius: 0,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  photoPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 0,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.backgroundAlt,
    alignItems: "center",
    justifyContent: "center",
  },
  photoPlaceholderText: {
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1,
  },
  detailsGrid: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    rowGap: Spacing.xs + 2,
    columnGap: Spacing.md,
  },
  detailItem: {
    width: "45%",
    gap: 2,
  },
  detailLabel: {
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 13,
  },
  footer: {
    marginTop: Spacing.xs,
    gap: Spacing.xs,
  },
  payButton: {
    borderRadius: 0,
  },
  offlineHint: {
    textAlign: "center",
    fontSize: 11,
  },
  confirmedFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs + 2,
    paddingTop: Spacing.xs,
  },
  confirmedText: {
    flex: 1,
    fontSize: 11,
  },
});
