import Constants from 'expo-constants';
import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, View } from 'react-native';

import { TabScrollView } from '@/components/tab-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import {
  useThemePreference,
  type ThemePreference,
} from '@/providers/theme-preference';

const appearanceOptions = [
  {
    value: 'system',
    label: '跟随系统',
    ios: 'circle.lefthalf.filled',
    android: 'contrast',
  },
  {
    value: 'light',
    label: '浅色',
    ios: 'sun.max.fill',
    android: 'light_mode',
  },
  {
    value: 'dark',
    label: '深色',
    ios: 'moon.fill',
    android: 'dark_mode',
  },
] as const satisfies readonly {
  ios: string;
  android: string;
  label: string;
  value: ThemePreference;
}[];

const appVersion = Constants.expoConfig?.version ?? '1.0.0';

export default function SettingsScreen() {
  const theme = useTheme();
  const { preference, setPreference } = useThemePreference();

  return (
    <TabScrollView>
      <View style={styles.titleBlock}>
        <ThemedText type="title">设置</ThemedText>
      </View>

      <View style={styles.sectionHeader}>
        <ThemedText type="smallBold" style={styles.sectionLabel}>
          偏好
        </ThemedText>
      </View>

      <View
        style={[
          styles.settingsCard,
          {
            backgroundColor: theme.backgroundElement,
            borderColor: theme.backgroundSelected,
          },
        ]}>
        <View style={styles.settingsRow}>
          <View style={[styles.settingsIcon, { backgroundColor: theme.accentSoft }]}>
            <SymbolView
              name={{ ios: 'circle.lefthalf.filled', android: 'contrast' }}
              tintColor={theme.accent}
              size={15}
            />
          </View>
          <ThemedText type="smallBold" style={styles.settingsTitle}>
            外观
          </ThemedText>
        </View>

        <View
          accessibilityLabel="外观"
          style={[styles.segmentedTrack, { backgroundColor: theme.backgroundSelected }]}>
          {appearanceOptions.map((option) => {
            const isSelected = preference === option.value;

            return (
              <Pressable
                key={option.value}
                accessibilityLabel={option.label}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                onPress={() => setPreference(option.value)}
                style={({ pressed }) => [
                  styles.segment,
                  isSelected && { backgroundColor: theme.accentSoft },
                  pressed && styles.segmentPressed,
                ]}>
                <SymbolView
                  name={{ ios: option.ios, android: option.android }}
                  tintColor={isSelected ? theme.accent : theme.textSecondary}
                  size={13}
                />
                <ThemedText
                  type="smallBold"
                  themeColor={isSelected ? 'accent' : 'textSecondary'}
                  style={styles.segmentLabel}>
                  {option.label}
                </ThemedText>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <ThemedText type="smallBold" style={styles.sectionLabel}>
          关于
        </ThemedText>
      </View>

      <View
        style={[
          styles.aboutCard,
          {
            backgroundColor: theme.backgroundElement,
            borderColor: theme.backgroundSelected,
          },
        ]}>
        <View style={styles.aboutRow}>
          <ThemedText themeColor="textSecondary">版本</ThemedText>
          <ThemedText type="smallBold">{appVersion}</ThemedText>
        </View>
      </View>
    </TabScrollView>
  );
}

const styles = StyleSheet.create({
  titleBlock: {
    gap: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionLabel: {
    fontSize: 13,
    lineHeight: 18,
  },
  settingsCard: {
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 48,
    paddingHorizontal: 14,
  },
  settingsIcon: {
    width: 30,
    height: 30,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsTitle: {
    flex: 1,
  },
  segmentedTrack: {
    flexDirection: 'row',
    gap: 2,
    marginHorizontal: 12,
    marginBottom: 12,
    padding: 3,
    borderRadius: 11,
  },
  segment: {
    flex: 1,
    minHeight: 34,
    paddingHorizontal: 4,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  segmentPressed: {
    opacity: 0.65,
  },
  segmentLabel: {
    fontSize: 12,
    lineHeight: 16,
  },
  aboutCard: {
    paddingHorizontal: 14,
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
  },
  aboutRow: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
