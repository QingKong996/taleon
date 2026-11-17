import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AppTabs from '@/components/app-tabs';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ProviderSettingsProvider } from '@/providers/provider-settings';
import { ThemePreferenceProvider } from '@/providers/theme-preference';

SplashScreen.preventAutoHideAsync();

export default function TabLayout() {
  return (
    <ThemePreferenceProvider>
      <ProviderSettingsProvider>
        <ThemedNavigation />
      </ProviderSettingsProvider>
    </ThemePreferenceProvider>
  );
}

function ThemedNavigation() {
  const colorScheme = useColorScheme();

  return (
    <>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <AnimatedSplashOverlay />
        <AppTabs />
      </ThemeProvider>
    </>
  );
}
