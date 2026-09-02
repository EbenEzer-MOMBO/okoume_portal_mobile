import { StyleSheet, Text as RNText, type TextProps as RNTextProps } from 'react-native';

import { Colors, FontFamily } from '@/constants/theme';

export type TextVariant =
  | 'display'
  | 'title'
  | 'heading'
  | 'price'
  | 'cardTitle'
  | 'bodyLg'
  | 'body'
  | 'bodySm'
  | 'caption'
  | 'label'
  | 'sectionTitle'
  | 'overline'
  | 'mono';

export type TextTone =
  | 'default'
  | 'body'
  | 'muted'
  | 'subtle'
  | 'accent'
  | 'inverse'
  | 'inverseMuted'
  | 'destructive';

export type TextProps = RNTextProps & {
  variant?: TextVariant;
  tone?: TextTone;
};

const TONES: Record<TextTone, string> = {
  default: Colors.text,
  body: Colors.textBody,
  muted: Colors.textMuted,
  subtle: Colors.textSubtle,
  accent: Colors.accent,
  inverse: Colors.onInk,
  inverseMuted: Colors.onInkMuted,
  destructive: Colors.destructive,
};

/** Texte typé par le design system : une variante = famille + taille + graisse. */
export function Text({ variant = 'body', tone = 'default', style, ...props }: TextProps) {
  return <RNText {...props} style={[styles[variant], { color: TONES[tone] }, style]} />;
}

const styles = StyleSheet.create({
  display: { fontFamily: FontFamily.serif, fontSize: 34, letterSpacing: -0.5, lineHeight: 40 },
  title: { fontFamily: FontFamily.serif, fontSize: 24, letterSpacing: -0.3, lineHeight: 30 },
  heading: { fontFamily: FontFamily.serif, fontSize: 18, letterSpacing: -0.2, lineHeight: 24 },
  price: { fontFamily: FontFamily.serifBold, fontSize: 18, lineHeight: 24 },
  cardTitle: { fontFamily: FontFamily.sansSemiBold, fontSize: 16, lineHeight: 21 },
  bodyLg: { fontFamily: FontFamily.sans, fontSize: 15, lineHeight: 21 },
  body: { fontFamily: FontFamily.sans, fontSize: 14, lineHeight: 20 },
  bodySm: { fontFamily: FontFamily.sans, fontSize: 13, lineHeight: 19 },
  caption: { fontFamily: FontFamily.sans, fontSize: 12, lineHeight: 18 },
  label: { fontFamily: FontFamily.sansMedium, fontSize: 13, lineHeight: 18 },
  sectionTitle: { fontFamily: FontFamily.sansSemiBold, fontSize: 13, lineHeight: 18 },
  overline: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 11,
    lineHeight: 15,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  mono: { fontFamily: FontFamily.mono, fontSize: 13, lineHeight: 18 },
});
