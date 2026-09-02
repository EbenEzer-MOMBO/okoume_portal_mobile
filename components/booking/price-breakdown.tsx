import { View } from 'react-native';

import { Divider } from '@/components/ui/divider';
import { SummaryRow } from '@/components/ui/summary-row';
import { Spacing } from '@/constants/theme';
import { Quote } from '@/lib/booking';
import { formatAmount, pluralize } from '@/lib/format';

export type PriceBreakdownProps = {
  quote: Quote;
  nightlyPrice: number;
  /** Affiche la ligne « Total » précédée d'un séparateur. */
  showTotal?: boolean;
  totalLabel?: string;
};

/** Détail tarifaire : nuits, taxe de séjour et total. */
export function PriceBreakdown({
  quote,
  nightlyPrice,
  showTotal = true,
  totalLabel = 'Total',
}: PriceBreakdownProps) {
  return (
    <View style={{ gap: Spacing.md }}>
      <SummaryRow
        label={`${pluralize(quote.nights, 'nuit')} × ${formatAmount(nightlyPrice)}`}
        value={formatAmount(quote.subtotal)}
      />
      {showTotal ? (
        <>
          <Divider />
          <SummaryRow label={totalLabel} value={formatAmount(quote.total)} emphasis="total" />
        </>
      ) : null}
    </View>
  );
}
