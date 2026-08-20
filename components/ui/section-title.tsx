import { Text } from '@/components/ui/text';
import { Spacing } from '@/constants/theme';

export type SectionTitleProps = {
  children: string;
  /** Marge haute (0 pour la première section d'un bloc). */
  spacingTop?: number;
};

export function SectionTitle({ children, spacingTop = Spacing['2xl'] }: SectionTitleProps) {
  return (
    <Text variant="sectionTitle" style={{ marginTop: spacingTop, marginBottom: 10 }}>
      {children}
    </Text>
  );
}
