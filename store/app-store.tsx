import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useMemo, useReducer, type ReactNode } from 'react';

import { ChambreDisponible } from '@/lib/api/types';
import { PaymentOptionId } from '@/lib/booking';
import { ROOM_TYPES, RoomType } from '@/constants/hotel';

/** Clé AsyncStorage : références de réservation suivies sur cet appareil (la plus récente en tête). */
const TRACKED_REFERENCES_KEY = 'okoume.trackedReferences';

export type LocalNotification = {
  id: string;
  reference: string;
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
  search: { arrival: number; departure: number; roomType: RoomType; guests: string };
  selectedRoom: ChambreDisponible | null;
  /** Modalité de paiement choisie sur le Récapitulatif, lue par l'écran Paiement. */
  paymentOption: PaymentOptionId | null;
  trackedReferences: string[];
  referencesHydrated: boolean;
  notifications: LocalNotification[];
  prefs: NotificationPrefs;
};

type Action =
  | { type: 'setDates'; arrival: number; departure: number }
  | { type: 'setRoomType'; roomType: RoomType }
  | { type: 'setGuests'; guests: string }
  | { type: 'selectRoom'; room: ChambreDisponible }
  | { type: 'setPaymentOption'; option: PaymentOptionId }
  | { type: 'hydrateReferences'; references: string[] }
  | { type: 'trackReference'; reference: string }
  | { type: 'addNotification'; notification: LocalNotification }
  | { type: 'readNotification'; id: string }
  | { type: 'readAllNotifications' }
  | { type: 'togglePref'; key: keyof NotificationPrefs };

const INITIAL_STATE: State = {
  search: { arrival: 12, departure: 15, roomType: ROOM_TYPES[0], guests: '2' },
  selectedRoom: null,
  paymentOption: null,
  trackedReferences: [],
  referencesHydrated: false,
  notifications: [],
  prefs: { push: true, email: true, promos: false },
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'setDates':
      return { ...state, search: { ...state.search, arrival: action.arrival, departure: action.departure } };
    case 'setRoomType':
      return { ...state, search: { ...state.search, roomType: action.roomType } };
    case 'setGuests':
      return { ...state, search: { ...state.search, guests: action.guests } };
    case 'selectRoom':
      return { ...state, selectedRoom: action.room };
    case 'setPaymentOption':
      return { ...state, paymentOption: action.option };
    case 'hydrateReferences':
      return { ...state, trackedReferences: action.references, referencesHydrated: true };
    case 'trackReference': {
      const next = [action.reference, ...state.trackedReferences.filter((ref) => ref !== action.reference)];
      return { ...state, trackedReferences: next };
    }
    case 'addNotification':
      return { ...state, notifications: [action.notification, ...state.notifications] };
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
  /** Référence de séjour la plus récente suivie sur cet appareil. */
  activeReference: string | null;
  unreadCount: number;
  actions: {
    setDates: (arrival: number, departure: number) => void;
    setRoomType: (roomType: RoomType) => void;
    setGuests: (guests: string) => void;
    selectRoom: (room: ChambreDisponible) => void;
    setPaymentOption: (option: PaymentOptionId) => void;
    trackReference: (reference: string) => void;
    addNotification: (notification: Omit<LocalNotification, 'id'>) => void;
    readNotification: (id: string) => void;
    readAllNotifications: () => void;
    togglePref: (key: keyof NotificationPrefs) => void;
  };
};

const AppStoreContext = createContext<AppStore | null>(null);

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);

  useEffect(() => {
    AsyncStorage.getItem(TRACKED_REFERENCES_KEY).then((raw) => {
      const references: string[] = raw ? JSON.parse(raw) : [];
      dispatch({ type: 'hydrateReferences', references });
    });
  }, []);

  const value = useMemo<AppStore>(() => {
    const trackReference = (reference: string) => {
      dispatch({ type: 'trackReference', reference });
      AsyncStorage.getItem(TRACKED_REFERENCES_KEY).then((raw) => {
        const current: string[] = raw ? JSON.parse(raw) : [];
        const next = [reference, ...current.filter((ref) => ref !== reference)];
        AsyncStorage.setItem(TRACKED_REFERENCES_KEY, JSON.stringify(next));
      });
    };

    const addNotification = (notification: Omit<LocalNotification, 'id'>) => {
      const id = `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      dispatch({ type: 'addNotification', notification: { ...notification, id } });
    };

    return {
      state,
      activeReference: state.trackedReferences[0] ?? null,
      unreadCount: state.notifications.filter((n) => n.unread).length,
      actions: {
        setDates: (arrival, departure) => dispatch({ type: 'setDates', arrival, departure }),
        setRoomType: (roomType) => dispatch({ type: 'setRoomType', roomType }),
        setGuests: (guests) => dispatch({ type: 'setGuests', guests }),
        selectRoom: (room) => dispatch({ type: 'selectRoom', room }),
        setPaymentOption: (option) => dispatch({ type: 'setPaymentOption', option }),
        trackReference,
        addNotification,
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
