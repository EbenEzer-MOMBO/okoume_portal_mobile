import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Animated, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { Colors, Radius, Spacing, TAB_BAR_HEIGHT } from '@/constants/theme';

const TOAST_DURATION = 2200;

const ToastContext = createContext<((message: string) => void) | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState('');
  const opacity = useRef(new Animated.Value(0)).current;
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const insets = useSafeAreaInsets();

  const show = useCallback(
    (next: string) => {
      if (timeout.current) clearTimeout(timeout.current);
      setMessage(next);
      Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }).start();
      timeout.current = setTimeout(() => {
        Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => setMessage(''));
      }, TOAST_DURATION);
    },
    [opacity]
  );

  useEffect(() => () => {
    if (timeout.current) clearTimeout(timeout.current);
  }, []);

  const value = useMemo(() => show, [show]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {message ? (
        <Animated.View
          pointerEvents="none"
          style={[styles.toast, { opacity, bottom: TAB_BAR_HEIGHT + Spacing.xl + insets.bottom }]}>
          <Icon name="check" size={15} color={Colors.onInkMuted} />
          <Text variant="bodySm" tone="inverse" style={styles.message}>
            {message}
          </Text>
        </Animated.View>
      ) : null}
    </ToastContext.Provider>
  );
}

/** Affiche un message de confirmation éphémère. */
export function useToast(): (message: string) => void {
  const show = useContext(ToastContext);
  if (!show) {
    throw new Error('useToast doit être utilisé à l’intérieur de <ToastProvider>.');
  }
  return show;
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    left: Spacing.xl,
    right: Spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm + 1,
    backgroundColor: Colors.ink,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md + 1,
    paddingHorizontal: Spacing.lg,
  },
  message: { flex: 1 },
});
