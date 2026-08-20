import Feather from '@expo/vector-icons/Feather';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { ComponentProps } from 'react';
import { StyleProp, TextStyle } from 'react-native';

import { Colors } from '@/constants/theme';

type FeatherName = ComponentProps<typeof Feather>['name'];
type MaterialName = ComponentProps<typeof MaterialCommunityIcons>['name'];

/**
 * Jeu d'icônes de l'app. Les noms sont sémantiques : les écrans ne
 * connaissent jamais la librairie d'icônes sous-jacente.
 */
const ICONS = {
  back: { family: 'feather', name: 'arrow-left' },
  chevron: { family: 'feather', name: 'chevron-right' },
  calendar: { family: 'feather', name: 'calendar' },
  guests: { family: 'feather', name: 'users' },
  search: { family: 'feather', name: 'search' },
  filters: { family: 'feather', name: 'sliders' },
  check: { family: 'feather', name: 'check' },
  location: { family: 'feather', name: 'map-pin' },
  phone: { family: 'feather', name: 'phone' },
  map: { family: 'feather', name: 'map' },
  clock: { family: 'feather', name: 'clock' },
  bell: { family: 'feather', name: 'bell' },
  promo: { family: 'feather', name: 'tag' },
  download: { family: 'feather', name: 'download' },
  lock: { family: 'feather', name: 'lock' },
  copy: { family: 'feather', name: 'copy' },
  home: { family: 'feather', name: 'home' },
  profile: { family: 'feather', name: 'user' },
  bed: { family: 'material', name: 'bed-outline' },
  plus: { family: 'feather', name: 'plus' },
  minus: { family: 'feather', name: 'minus' },
  cart: { family: 'feather', name: 'shopping-bag' },
  trash: { family: 'feather', name: 'trash-2' },
} as const satisfies Record<string, { family: 'feather'; name: FeatherName } | { family: 'material'; name: MaterialName }>;

export type IconName = keyof typeof ICONS;

export type IconProps = {
  name: IconName;
  size?: number;
  color?: string;
  style?: StyleProp<TextStyle>;
};

export function Icon({ name, size = 18, color = Colors.text, style }: IconProps) {
  const icon = ICONS[name];

  if (icon.family === 'material') {
    return <MaterialCommunityIcons name={icon.name} size={size} color={color} style={style} />;
  }
  return <Feather name={icon.name} size={size} color={color} style={style} />;
}
