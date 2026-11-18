import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { ScrubbableNumberField } from '@/components/ui/scrubbable-number-field';
import { Surface } from '@/components/ui/surface';
import { ThemedText } from '@/components/themed-text';
import { Radius } from '@/constants/theme';
import {
  DEFAULT_SECTION_COUNT,
  MAX_SECTION_COUNT,
  MIN_SECTION_COUNT,
  type StoryOutlineChapter,
} from '@/features/workspace/model/workbench-data';
import { useTheme } from '@/hooks/use-theme';

type OutlinePreviewProps = {
  chapters: readonly StoryOutlineChapter[];
  disabled?: boolean;
  generatingSectionsChapter?: number | null;
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

export function OutlinePreview({
  chapters,
  disabled = false,
  generatingSectionsChapter = null,
  onEditChapter,
  onEditSection,
  onGenerateSections,
}: OutlinePreviewProps) {
  return (
    <View style={styles.list}>
      {chapters.map((chapter, index) => (
        <OutlinePreviewChapter
          chapter={chapter}
          disabled={disabled}
          generatingSections={
            generatingSectionsChapter === chapter.chapterNumber
          }
          initiallyExpanded={index === 0}
          key={chapter.chapterNumber}
          onEditChapter={onEditChapter}
          onEditSection={onEditSection}
          onGenerateSections={onGenerateSections}
        />
      ))}
    </View>
  );
}

type OutlinePreviewChapterProps = {
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

function OutlinePreviewChapter({
  chapter,
  disabled,
  generatingSections,
  initiallyExpanded,
  onEditChapter,
  onEditSection,
  onGenerateSections,
}: OutlinePreviewChapterProps) {
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
                  {onEditSection ? (
                    <Pressable
                      accessibilityLabel={`编辑第 ${chapter.chapterNumber} 章第 ${index + 1} 节`}
                      accessibilityRole="button"
                      accessibilityState={{ disabled }}
                      disabled={disabled}
                      hitSlop={8}
                      onPress={() =>
                        onEditSection(
                          chapter.chapterNumber,
                          index,
                        )
                      }
                      style={({ pressed }) =>
                        pressed && styles.pressed
                      }>
                      <ThemedText
                        type="smallBold"
                        themeColor={
                          disabled ? 'textSecondary' : 'accent'
                        }
                        style={styles.sectionEdit}>
                        编辑
                      </ThemedText>
                    </Pressable>
                  ) : null}
                </View>
                <ThemedText
                  type="small"
                  themeColor="textSecondary"
                  style={styles.sectionOutline}>
                  {section.outline}
                </ThemedText>
              </View>
            ))
          ) : (
            <ThemedText type="small" themeColor="textSecondary">
              尚未生成节大纲
            </ThemedText>
          )}

          {onGenerateSections ? (
            <View
              style={[
                styles.generator,
                { borderTopColor: theme.backgroundSelected },
              ]}>
              <View style={styles.generatorCopy}>
                <ThemedText type="smallBold" style={styles.generatorTitle}>
                  节大纲
                </ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {chapter.sections.length > 0
                    ? '按新的节数重新生成会覆盖现有节'
                    : '将本章拆成有推进关系的节'}
                </ThemedText>
              </View>
              <View style={styles.generatorActions}>
                <View style={styles.sectionCountField}>
                  <ScrubbableNumberField
                    compact
                    disabled={disabled}
                    label="节数"
                    max={MAX_SECTION_COUNT}
                    maxLength={2}
                    min={MIN_SECTION_COUNT}
                    onChange={setSectionCount}
                    suffix="节"
                    value={sectionCount}
                  />
                </View>
                <Button
                  disabled={disabled}
                  label={
                    chapter.sections.length > 0
                      ? '重新生成'
                      : '生成节'
                  }
                  loading={generatingSections}
                  onPress={() =>
                    onGenerateSections(
                      chapter.chapterNumber,
                      sectionCount,
                    )
                  }
                  size="compact"
                  variant="soft"
                />
              </View>
            </View>
          ) : null}
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
  chapterEditRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
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
  sectionEdit: {
    fontSize: 11,
    lineHeight: 15,
  },
  generator: {
    gap: 7,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 9,
  },
  generatorCopy: {
    gap: 1,
  },
  generatorTitle: {
    fontSize: 12,
    lineHeight: 16,
  },
  generatorActions: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 7,
  },
  sectionCountField: {
    width: 88,
  },
  pressed: {
    opacity: 0.62,
  },
});
