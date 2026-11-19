import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import type { StoryOutlineChapter } from '@/features/workspace/model/workbench-data';
import { useTheme } from '@/hooks/use-theme';

type OutlineChapterHeaderProps = {
  chapter: StoryOutlineChapter;
  expanded: boolean;
  onToggle: () => void;
  sectionLabel: string;
};

export function OutlineChapterHeader({
  chapter,
  expanded,
  onToggle,
  sectionLabel,
}: OutlineChapterHeaderProps) {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityLabel={`第 ${chapter.chapterNumber} 章，${chapter.title}，${sectionLabel}，${
        expanded ? '已展开' : '已折叠'
      }`}
      accessibilityRole="button"
      accessibilityState={{ expanded }}
      onPress={onToggle}
      style={({ pressed }) => [
        styles.header,
        pressed && styles.pressed,
      ]}>
      <View
        style={[
          styles.chapterNumber,
          {
            backgroundColor: theme.background,
            borderColor: theme.backgroundSelected,
          },
        ]}>
        <ThemedText type="smallBold" style={styles.chapterNumberText}>
          {String(chapter.chapterNumber).padStart(2, '0')}
        </ThemedText>
      </View>

      <View style={styles.copy}>
        <View style={styles.titleRow}>
          <ThemedText
            numberOfLines={1}
            type="smallBold"
            style={styles.title}>
            {chapter.title}
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {sectionLabel}
          </ThemedText>
        </View>
        <ThemedText
          numberOfLines={expanded ? undefined : 2}
          type="small"
          themeColor="textSecondary"
          style={styles.outline}>
          {chapter.outline}
        </ThemedText>
        {!expanded && chapter.sections.length > 0 ? (
          <ThemedText
            numberOfLines={1}
            themeColor="accent"
            style={styles.sectionPreview}>
            {chapter.sections
              .map((section) => section.title)
              .join(' · ')}
          </ThemedText>
        ) : null}
      </View>

      <SymbolView
        name={
          expanded
            ? { ios: 'chevron.up', android: 'keyboard_arrow_up' }
            : { ios: 'chevron.down', android: 'keyboard_arrow_down' }
        }
        size={15}
        tintColor={theme.textSecondary}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 9,
    padding: 9,
  },
  chapterNumber: {
    width: 26,
    height: 26,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chapterNumberText: {
    fontSize: 11,
    lineHeight: 14,
    fontVariant: ['tabular-nums'],
  },
  copy: {
    flex: 1,
    gap: 3,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  title: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  outline: {
    fontSize: 12,
    lineHeight: 18,
  },
  sectionPreview: {
    fontSize: 11,
    lineHeight: 16,
  },
  pressed: {
    opacity: 0.62,
  },
});
