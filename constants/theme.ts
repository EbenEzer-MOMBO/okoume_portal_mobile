/**
 * Design system Ya Hôtel — source unique de vérité pour les couleurs, la
 * typographie, les espacements et les rayons utilisés dans toute l'app.
 * Toute valeur littérale (hex, taille de police) doit être déclarée ici.
 */

export const Colors = {
  /** Noir bois — surfaces primaires, texte principal */
  ink: '#1C1B19',
  /** Texte sur fond ink */
  onInk: '#FAF9F6',
  /** Texte secondaire sur fond ink */
  onInkMuted: '#C9BCA9',
  /** Brun okoumé — accent */
  accent: '#8B7355',

  /** Fond principal (blanc) */
  background: '#FFFFFF',
  /** Fond secondaire (blanc) */
  backgroundAlt: '#FFFFFF',
  /** Fond neutre appuyé (pistes de segmented control, canvas) */
  backgroundMuted: '#EDE9E2',
  /** Cartes */
  surface: '#FFFFFF',

  border: '#E7E5E4',
  borderStrong: '#D6D3D1',

  text: '#1C1B19',
  textBody: '#3F3B37',
  textNeutral: '#57534E',
  textMuted: '#78706A',
  textSubtle: '#A8A29A',
  textDisabled: '#CFC9C0',

  destructive: '#EF4444',
  success: '#10B981',

  /** Badges neutres (statut « Terminée ») */
  badgeMutedBg: '#F4F4F5',
  badgeMutedFg: '#52504C',

  /** Notifications non lues */
  unreadBg: '#FBF7F1',
  unreadIconBg: '#F0E7DA',
  readIconBg: '#F4F4F5',

  /** Emplacements photo (rayures diagonales) */
  photoBase: '#EFEAE2',
  photoStripe: '#E6E0D5',

  /** Point inactif du carrousel photo */
  dotInactive: 'rgba(28,27,25,0.28)',

  overlay: 'rgba(28,27,25,0.35)',
  overlayStrong: 'rgba(28,27,25,0.4)',
  onInkDivider: 'rgba(250,249,246,0.14)',
} as const;

export const FontFamily = {
  serif: 'Fraunces_400Regular',
  serifBold: 'Fraunces_600SemiBold',
  serifItalic: 'Fraunces_600SemiBold_Italic',
  sans: 'Inter_400Regular',
  sansMedium: 'Inter_500Medium',
  sansSemiBold: 'Inter_500Medium',
  mono: 'IBMPlexMono_400Regular',
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
} as const;

export const Radius = {
  sm: 0,
  md: 0,
  lg: 0,
  sheet: 0,
  pill: 999,
} as const;

/** Hauteurs de contrôles interactifs (cible tactile ≥ 44 px). */
export const ControlHeight = {
  input: 44,
  button: 48,
  buttonLarge: 50,
} as const;

export const Shadow = {
  card: {
    shadowColor: Colors.ink,
    shadowOpacity: 0.05,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
} as const;

/** Hauteur de la barre d'onglets, utilisée pour réserver l'espace de scroll. */
export const TAB_BAR_HEIGHT = 84;
