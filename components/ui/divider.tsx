import { View } from 'react-native';

import { Colors } from '@/constants/theme';

export type DividerProps = {
  /** `inverse` : séparateur posé sur une surface noir bois. */
  tone?: 'default' | 'inverse';
};

export function Divider({ tone = 'default' }: DividerProps) {
  return <View style={{ height: 1, backgroundColor: tone === 'inverse' ? Colors.onInkDivider : Colors.border }} />;
}
