import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Surface } from '@/components/ui/surface';
import { ThemedText } from '@/components/themed-text';
import { Radius } from '@/constants/theme';
import {
  DEFAULT_SECTION_COUNT,
  MAX_SECTION_COUNT,
  MIN_SECTION_COUNT,
  type StoryOutlineChapter,
} from '@/features/workspace/model/workbench-data';
import { OutlineSectionGenerator } from '@/features/workspace/ui/outline/outline-section-generator';
import { OutlineSectionRow } from '@/features/workspace/ui/outline/outline-section-row';
import { useTheme } from '@/hooks/use-theme';

type OutlineChapterCardProps = {
  chapter: StoryOutlineChapter;
  disabled: boolean;
  generatingSections: boolean;
  initiallyExpanded: boolean;
  onEditChapter?: (chapterNumber: number) => void;
  onEditSection?: (
    chapterNumber: number,
    sectionIndex: number,
  ) => void;
  onGenerateSections?: (
    chapterNumber: number,
    sectionCount: number,
  ) => void;
};

export function OutlineChapterCard({
  chapter,
  disabled,
  generatingSections,
  initiallyExpanded,
  onEditChapter,
  onEditSection,
  onGenerateSections,
}: OutlineChapterCardProps) {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(
    initiallyExpanded || chapter.sections.length > 0,
  );
  const [sectionCount, setSectionCount] = useState(
    chapter.sections.length > 0
      ? Math.min(
          MAX_SECTION_COUNT,
          Math.max(MIN_SECTION_COUNT, chapter.sections.length),
        )
      : DEFAULT_SECTION_COUNT,
  );
  const sectionLabel =
    chapter.sections.length > 0
      ? `${chapter.sections.length} 节`
      : '待生成节';

  return (
    <Surface radius={Radius.compact} style={styles.card}>
      <Pressable
        accessibilityLabel={`第 ${chapter.chapterNumber} 章，${chapter.title}，${sectionLabel}，${
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

      {expanded ? (
        <View
          style={[
            styles.sections,
            { borderTopColor: theme.backgroundSelected },
          ]}>
          {onEditChapter ? (
            <View style={styles.chapterEditRow}>
              <ThemedText type="small" themeColor="textSecondary">
                章名与大纲
              </ThemedText>
              <Pressable
                accessibilityLabel={`编辑第 ${chapter.chapterNumber} 章`}
                accessibilityRole="button"
                accessibilityState={{ disabled }}
                disabled={disabled}
                hitSlop={8}
                onPress={() => onEditChapter(chapter.chapterNumber)}
                style={({ pressed }) => pressed && styles.pressed}>
                <ThemedText
                  type="smallBold"
                  themeColor={disabled ? 'textSecondary' : 'accent'}>
                  编辑
                </ThemedText>
              </Pressable>
            </View>
          ) : null}

          {chapter.sections.length > 0 ? (
            chapter.sections.map((section, index) => (
              <OutlineSectionRow
                chapterNumber={chapter.chapterNumber}
                disabled={disabled}
                index={index}
                key={`${chapter.chapterNumber}-${index}`}
                onEdit={onEditSection}
                section={section}
              />
            ))
          ) : (
            <ThemedText type="small" themeColor="textSecondary">
              尚未生成节大纲
            </ThemedText>
          )}

          {onGenerateSections ? (
            <OutlineSectionGenerator
              disabled={disabled}
              generating={generatingSections}
              hasSections={chapter.sections.length > 0}
              onChangeSectionCount={setSectionCount}
              onGenerate={() =>
                onGenerateSections(chapter.chapterNumber, sectionCount)
              }
              sectionCount={sectionCount}
            />
          ) : null}
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
  chapterEditRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  pressed: {
    opacity: 0.62,
  },
});
