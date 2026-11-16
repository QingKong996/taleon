import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren,
} from 'react';
import { Appearance, useColorScheme as useDeviceColorScheme } from 'react-native';

export type ThemePreference = 'system' | 'light' | 'dark';
export type ResolvedColorScheme = 'light' | 'dark';

type ThemePreferenceContextValue = {
  colorScheme: ResolvedColorScheme;
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => void;
};

const STORAGE_KEY = 'taleon-theme-preference-v1';
const ThemePreferenceContext = createContext<ThemePreferenceContextValue | null>(null);

function isThemePreference(value: string | null): value is ThemePreference {
  return value === 'system' || value === 'light' || value === 'dark';
}

export function ThemePreferenceProvider({ children }: PropsWithChildren) {
  const deviceColorScheme = useDeviceColorScheme();
  const [preference, setPreferenceState] = useState<ThemePreference>('system');
  const userHasSelected = useRef(false);

  useEffect(() => {
    let isMounted = true;

    AsyncStorage.getItem(STORAGE_KEY)
      .then((storedPreference) => {
        if (isMounted && !userHasSelected.current && isThemePreference(storedPreference)) {
          setPreferenceState(storedPreference);
        }
      })
      .catch(() => {
        // Keep the system default when local storage is unavailable.
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    Appearance.setColorScheme(preference === 'system' ? 'auto' : preference);
  }, [preference]);

  const setPreference = useCallback((nextPreference: ThemePreference) => {
    userHasSelected.current = true;
    setPreferenceState(nextPreference);
    void AsyncStorage.setItem(STORAGE_KEY, nextPreference).catch(() => {
      // The in-memory preference still applies for the current session.
    });
  }, []);

  const colorScheme =
    preference === 'system' ? (deviceColorScheme ?? 'light') : preference;

  const value = useMemo(
    () => ({ colorScheme, preference, setPreference }),
    [colorScheme, preference, setPreference],
  );

  return (
    <ThemePreferenceContext.Provider value={value}>
      {children}
    </ThemePreferenceContext.Provider>
  );
}

export function useThemePreference() {
  const context = useContext(ThemePreferenceContext);

  if (!context) {
    throw new Error('useThemePreference must be used within ThemePreferenceProvider');
  }

  return context;
}

export function useThemeColorScheme(): ResolvedColorScheme {
  return useThemePreference().colorScheme;
}
