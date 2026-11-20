import '../../global.css';

import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AppTabs from '@/components/app-tabs';
import { GluestackUIProvider } from '@/components/gluestack/gluestack-ui-provider';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ProviderSettingsProvider } from '@/providers/provider-settings';
import {
  ThemePreferenceProvider,
  useThemePreference,
} from '@/providers/theme-preference';

SplashScreen.preventAutoHideAsync();

export default function TabLayout() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <ThemePreferenceProvider>
        <ProviderSettingsProvider>
          <ThemedNavigation />
        </ProviderSettingsProvider>
      </ThemePreferenceProvider>
    </GestureHandlerRootView>
  );
}

function ThemedNavigation() {
  const colorScheme = useColorScheme();
  const { preference } = useThemePreference();

  return (
    <GluestackUIProvider mode={preference}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <AnimatedSplashOverlay />
        <AppTabs />
      </ThemeProvider>
    </GluestackUIProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
