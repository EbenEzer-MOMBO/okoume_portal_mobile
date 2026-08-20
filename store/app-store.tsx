import { createContext, useContext, useMemo, useReducer, type ReactNode } from 'react';

import { DEFAULT_ROOM_ID, ROOMS, ROOM_TYPES, Room, RoomType } from '@/constants/hotel';
import { PaymentOptionId, Quote, computeQuote } from '@/lib/booking';

export type StayStatus = 'avenir' | 'encours' | 'termine' | 'aucune';
export type NotificationKind = 'confirm' | 'clock' | 'promo';

export type AppNotification = {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  time: string;
  unread: boolean;
};

export type NotificationPrefs = {
  push: boolean;
  email: boolean;
  promos: boolean;
};

type State = {
  authenticated: boolean;
  search: { arrival: number; departure: number; roomType: RoomType; guests: string };
  booking: { roomId: string; paymentOption: PaymentOptionId | null; paymentMethodId: string | null };
  reference: string;
  stayStatus: StayStatus;
  notifications: AppNotification[];
  prefs: NotificationPrefs;
};

type Action =
  | { type: 'signIn' }
  | { type: 'signOut' }
  | { type: 'setDates'; arrival: number; departure: number }
  | { type: 'setRoomType'; roomType: RoomType }
  | { type: 'setGuests'; guests: string }
  | { type: 'selectRoom'; roomId: string }
  | { type: 'setPaymentOption'; option: PaymentOptionId }
  | { type: 'setPaymentMethod'; methodId: string }
  | { type: 'confirmBooking' }
  | { type: 'readNotification'; id: string }
  | { type: 'readAllNotifications' }
  | { type: 'togglePref'; key: keyof NotificationPrefs };

const INITIAL_STATE: State = {
  authenticated: false,
  search: { arrival: 12, departure: 15, roomType: ROOM_TYPES[0], guests: '2' },
  booking: { roomId: DEFAULT_ROOM_ID, paymentOption: null, paymentMethodId: null },
  reference: 'OKM-2026-0413',
  stayStatus: 'avenir',
  notifications: [
    {
      id: 'n1',
      kind: 'confirm',
      title: 'Réservation confirmée',
      body: 'Votre séjour du 12 au 15 septembre est confirmé.',
      time: 'Il y a 2 h',
      unread: true,
    },
    {
      id: 'n2',
      kind: 'clock',
      title: 'Préparez votre arrivée',
      body: "Le check-in est possible dès 14 h. Pensez à votre pièce d'identité.",
      time: 'Hier',
      unread: true,
    },
    {
      id: 'n3',
      kind: 'promo',
      title: 'Offre séjour long',
      body: "-15 % à partir de cinq nuits, jusqu'au 30 septembre.",
      time: 'Il y a 3 jours',
      unread: false,
    },
  ],
  prefs: { push: true, email: true, promos: false },
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'signIn':
      return { ...state, authenticated: true };
    case 'signOut':
      return { ...state, authenticated: false };
    case 'setDates':
      return { ...state, search: { ...state.search, arrival: action.arrival, departure: action.departure } };
    case 'setRoomType':
      return { ...state, search: { ...state.search, roomType: action.roomType } };
    case 'setGuests':
      return { ...state, search: { ...state.search, guests: action.guests } };
    case 'selectRoom':
      return { ...state, booking: { ...state.booking, roomId: action.roomId } };
    case 'setPaymentOption':
      return { ...state, booking: { ...state.booking, paymentOption: action.option } };
    case 'setPaymentMethod':
      return { ...state, booking: { ...state.booking, paymentMethodId: action.methodId } };
    case 'confirmBooking':
      return { ...state, stayStatus: 'avenir' };
    case 'readNotification':
      return {
        ...state,
        notifications: state.notifications.map((n) => (n.id === action.id ? { ...n, unread: false } : n)),
      };
    case 'readAllNotifications':
      return { ...state, notifications: state.notifications.map((n) => ({ ...n, unread: false })) };
    case 'togglePref':
      return { ...state, prefs: { ...state.prefs, [action.key]: !state.prefs[action.key] } };
    default:
      return state;
  }
}

type AppStore = {
  state: State;
  /** Chambre actuellement sélectionnée. */
  room: Room;
  /** Devis calculé pour la chambre, les dates et la modalité en cours. */
  quote: Quote;
  hasStay: boolean;
  unreadCount: number;
  actions: {
    signIn: () => void;
    signOut: () => void;
    setDates: (arrival: number, departure: number) => void;
    setRoomType: (roomType: RoomType) => void;
    setGuests: (guests: string) => void;
    selectRoom: (roomId: string) => void;
    setPaymentOption: (option: PaymentOptionId) => void;
    setPaymentMethod: (methodId: string) => void;
    confirmBooking: () => void;
    readNotification: (id: string) => void;
    readAllNotifications: () => void;
    togglePref: (key: keyof NotificationPrefs) => void;
  };
};

const AppStoreContext = createContext<AppStore | null>(null);

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);

  const value = useMemo<AppStore>(() => {
    const room = ROOMS.find((r) => r.id === state.booking.roomId) ?? ROOMS[0];

    return {
      state,
      room,
      quote: computeQuote(room, state.search.arrival, state.search.departure, state.booking.paymentOption),
      hasStay: state.stayStatus !== 'aucune',
      unreadCount: state.notifications.filter((n) => n.unread).length,
      actions: {
        signIn: () => dispatch({ type: 'signIn' }),
        signOut: () => dispatch({ type: 'signOut' }),
        setDates: (arrival, departure) => dispatch({ type: 'setDates', arrival, departure }),
        setRoomType: (roomType) => dispatch({ type: 'setRoomType', roomType }),
        setGuests: (guests) => dispatch({ type: 'setGuests', guests }),
        selectRoom: (roomId) => dispatch({ type: 'selectRoom', roomId }),
        setPaymentOption: (option) => dispatch({ type: 'setPaymentOption', option }),
        setPaymentMethod: (methodId) => dispatch({ type: 'setPaymentMethod', methodId }),
        confirmBooking: () => dispatch({ type: 'confirmBooking' }),
        readNotification: (id) => dispatch({ type: 'readNotification', id }),
        readAllNotifications: () => dispatch({ type: 'readAllNotifications' }),
        togglePref: (key) => dispatch({ type: 'togglePref', key }),
      },
    };
  }, [state]);

  return <AppStoreContext.Provider value={value}>{children}</AppStoreContext.Provider>;
}

export function useAppStore(): AppStore {
  const store = useContext(AppStoreContext);
  if (!store) {
    throw new Error('useAppStore doit être utilisé à l’intérieur de <AppStoreProvider>.');
  }
  return store;
}
