import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Surface } from '@/components/ui/surface';
import { ThemedText } from '@/components/themed-text';
import { Radius } from '@/constants/theme';
import type { StoryOutlineChapter } from '@/features/workspace/workbench-data';
import { useTheme } from '@/hooks/use-theme';

type OutlinePreviewProps = {
  chapters: readonly StoryOutlineChapter[];
};

export function OutlinePreview({ chapters }: OutlinePreviewProps) {
  return (
    <View style={styles.list}>
      {chapters.map((chapter) => (
        <OutlinePreviewChapter
          chapter={chapter}
          key={chapter.chapterNumber}
        />
      ))}
    </View>
  );
}

type OutlinePreviewChapterProps = {
  chapter: StoryOutlineChapter;
};

function OutlinePreviewChapter({ chapter }: OutlinePreviewChapterProps) {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(false);

  return (
    <Surface radius={Radius.compact} style={styles.card}>
      <Pressable
        accessibilityLabel={`第 ${chapter.chapterNumber} 章，${chapter.title}，${chapter.sections.length} 节，${
          expanded ? '已展开' : '已折叠'
        }`}
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        onPress={() => setExpanded((current) => !current)}
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
              {chapter.sections.length} 节
            </ThemedText>
          </View>
          <ThemedText
            numberOfLines={expanded ? undefined : 2}
            type="small"
            themeColor="textSecondary"
            style={styles.outline}>
            {chapter.outline}
          </ThemedText>
          {!expanded ? (
            <ThemedText
              numberOfLines={1}
              themeColor="accent"
              style={styles.sectionPreview}>
              {chapter.sections.map((section) => section.title).join(' · ')}
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

      {expanded ? (
        <View
          style={[
            styles.sections,
            { borderTopColor: theme.backgroundSelected },
          ]}>
          {chapter.sections.map((section, index) => (
            <View
              key={`${chapter.chapterNumber}-${index}`}
              style={styles.section}>
              <View style={styles.sectionHeading}>
                <ThemedText
                  type="smallBold"
                  themeColor="accent"
                  style={styles.sectionNumber}>
                  第 {index + 1} 节
                </ThemedText>
                <ThemedText
                  numberOfLines={1}
                  type="smallBold"
                  style={styles.sectionTitle}>
                  {section.title}
                </ThemedText>
              </View>
              <ThemedText
                type="small"
                themeColor="textSecondary"
                style={styles.sectionOutline}>
                {section.outline}
              </ThemedText>
            </View>
          ))}
        </View>
      ) : null}
    </Surface>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 6,
  },
  card: {
    overflow: 'hidden',
  },
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
  sections: {
    gap: 9,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 10,
    paddingTop: 9,
    paddingBottom: 10,
  },
  section: {
    gap: 2,
  },
  sectionHeading: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  sectionNumber: {
    fontSize: 11,
    lineHeight: 15,
  },
  sectionTitle: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
  },
  sectionOutline: {
    paddingLeft: 48,
    fontSize: 12,
    lineHeight: 18,
  },
  pressed: {
    opacity: 0.62,
  },
});
