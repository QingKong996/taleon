import Constants from 'expo-constants';
import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, View } from 'react-native';

import { TabScrollView } from '@/components/tab-scroll-view';
import { SectionHeader } from '@/components/ui/section-header';
import { Surface } from '@/components/ui/surface';
import { ThemedText } from '@/components/themed-text';
import { Layout, Radius } from '@/constants/theme';
import { AppearancePicker } from '@/features/settings/appearance-picker';
import { useTheme } from '@/hooks/use-theme';
import { useProviderSettings } from '@/providers/provider-settings';
import { useThemePreference } from '@/providers/theme-preference';

const APP_VERSION = Constants.expoConfig?.version ?? '1.0.0';

export function SettingsScreen() {
  const theme = useTheme();
  const { preference, setPreference } = useThemePreference();
  const { configs } = useProviderSettings();
  const providerDetail =
    configs.length > 0 ? `已添加 ${configs.length} 个` : '未添加';

  return (
    <TabScrollView>
      <View style={styles.titleBlock}>
        <ThemedText type="title">设置</ThemedText>
      </View>

      <View style={styles.section}>
        <SectionHeader title="偏好" />
        <Surface radius={Radius.panel} style={styles.card}>
          <View style={styles.row}>
            <View
              style={[
                styles.icon,
                { backgroundColor: theme.accentSoft },
              ]}>
              <SymbolView
                name={{
                  ios: 'circle.lefthalf.filled',
                  android: 'contrast',
                }}
                size={15}
                tintColor={theme.accent}
              />
            </View>
            <ThemedText type="smallBold" style={styles.rowTitle}>
              外观
            </ThemedText>
          </View>
          <AppearancePicker
            onChange={setPreference}
            value={preference}
          />
        </Surface>
      </View>

      <View style={styles.section}>
        <SectionHeader title="模型" />
        <Surface radius={Radius.panel} style={styles.card}>
          <Pressable
            accessibilityLabel={`供应商，${providerDetail}`}
            accessibilityRole="button"
            onPress={() => router.push('/settings/providers')}
            style={({ pressed }) => [
              styles.row,
              pressed && styles.pressed,
            ]}>
            <View
              style={[
                styles.icon,
                { backgroundColor: theme.accentSoft },
              ]}>
              <SymbolView
                name={{ ios: 'server.rack', android: 'dns' }}
                size={15}
                tintColor={theme.accent}
              />
            </View>
            <ThemedText type="smallBold" style={styles.rowTitle}>
              供应商
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {providerDetail}
            </ThemedText>
            <SymbolView
              name={{ ios: 'chevron.right', android: 'chevron_right' }}
              size={14}
              tintColor={theme.textSecondary}
            />
          </Pressable>
        </Surface>
      </View>

      <View style={styles.section}>
        <SectionHeader title="关于" />
        <Surface
          radius={Radius.panel}
          style={[styles.card, styles.aboutCard]}>
          <View style={styles.aboutRow}>
            <ThemedText themeColor="textSecondary">版本</ThemedText>
            <ThemedText type="smallBold">{APP_VERSION}</ThemedText>
          </View>
        </Surface>
      </View>
    </TabScrollView>
  );
}

const styles = StyleSheet.create({
  titleBlock: {
    gap: 2,
  },
  section: {
    gap: Layout.sectionGap,
  },
  card: {
    overflow: 'hidden',
  },
  row: {
    minHeight: 48,
    paddingHorizontal: Layout.cardPadding,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  icon: {
    width: 30,
    height: 30,
    borderRadius: Radius.compact,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowTitle: {
    flex: 1,
  },
  pressed: {
    opacity: 0.62,
  },
  aboutCard: {
    paddingHorizontal: Layout.cardPadding,
  },
  aboutRow: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
