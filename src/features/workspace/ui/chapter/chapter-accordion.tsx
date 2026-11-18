import { SymbolView } from 'expo-symbols';
import type { ReactNode } from 'react';
import {
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { Surface } from '@/components/ui/surface';
import { ThemedText } from '@/components/themed-text';
import { Radius } from '@/constants/theme';
import type { OutlineChapter } from '@/features/workspace/model/workbench-data';
import { useTheme } from '@/hooks/use-theme';

type ChapterAccordionProps = {
  chapter: OutlineChapter;
  children: ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
  expanded: boolean;
  index: number;
  onToggle: () => void;
  selected: boolean;
};

export function ChapterAccordion({
  chapter,
  children,
  contentStyle,
  expanded,
  index,
  onToggle,
  selected,
}: ChapterAccordionProps) {
  const theme = useTheme();

  return (
    <Surface
      radius={Radius.card}
      selected={selected}
      style={styles.card}>
      <Pressable
        accessibilityLabel={`第 ${index + 1} 章，${chapter.title}，${chapter.beat}，${
          expanded ? '已展开' : '已折叠'
        }`}
        accessibilityRole="button"
        accessibilityState={{ expanded, selected }}
        onPress={onToggle}
        style={({ pressed }) => [
          styles.header,
          pressed && styles.pressed,
        ]}>
        <View
          style={[
            styles.chapterNumber,
            {
              backgroundColor: selected ? theme.accent : theme.background,
              borderColor: selected
                ? theme.accent
                : theme.backgroundSelected,
            },
          ]}>
          <ThemedText
            type="smallBold"
            style={[
              styles.chapterNumberText,
              {
                color: selected ? theme.background : theme.textSecondary,
              },
            ]}>
            {String(index + 1).padStart(2, '0')}
          </ThemedText>
        </View>

        <View style={styles.copy}>
          <View style={styles.titleRow}>
            <ThemedText type="smallBold" style={styles.title}>
              {chapter.title}
            </ThemedText>
            <ThemedText
              type="small"
              themeColor={selected ? 'accent' : 'textSecondary'}
              style={styles.beat}>
              {chapter.beat}
            </ThemedText>
          </View>
        </View>

        <SymbolView
          name={
            expanded
              ? { ios: 'chevron.up', android: 'keyboard_arrow_up' }
              : { ios: 'chevron.down', android: 'keyboard_arrow_down' }
          }
          size={18}
          tintColor={selected ? theme.accent : theme.textSecondary}
        />
      </Pressable>

      {expanded ? (
        <View
          style={[
            styles.content,
            { borderTopColor: theme.backgroundSelected },
            contentStyle,
          ]}>
          {children}
        </View>
      ) : null}
    </Surface>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
  },
  chapterNumber: {
    width: 36,
    height: 36,
    borderRadius: 11,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chapterNumberText: {
    fontSize: 12,
    lineHeight: 16,
    fontVariant: ['tabular-nums'],
  },
  copy: {
    flex: 1,
    gap: 3,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    flex: 1,
  },
  beat: {
    fontSize: 12,
    lineHeight: 16,
  },
  content: {
    gap: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    padding: 12,
  },
  pressed: {
    opacity: 0.62,
  },
});
