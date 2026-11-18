import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';

import { Button } from '@/components/ui/button';
import { ScrubbableNumberField } from '@/components/ui/scrubbable-number-field';
import { Surface } from '@/components/ui/surface';
import { ThemedText } from '@/components/themed-text';
import { Radius } from '@/constants/theme';
import type { OutlineGenerationResult } from '@/features/workspace/model/outline/outline-parser';
import { useOutlineGenerator } from '@/features/workspace/model/outline/use-outline-generator';
import {
  MAX_CHAPTER_COUNT,
  MAX_WORDS_PER_CHAPTER,
  MIN_CHAPTER_COUNT,
  MIN_WORDS_PER_CHAPTER,
  type StoryOutlineChapter,
  type StoryOutlineEntry,
  type StoryOutlineSection,
} from '@/features/workspace/model/workbench-data';
import {
  OutlineEditorModal,
  type OutlineEditorTarget,
} from '@/features/workspace/ui/outline/outline-editor-modal';
import { OutlinePreview } from '@/features/workspace/ui/outline/outline-preview';
import { useTheme } from '@/hooks/use-theme';

type OutlineStepProps = {
  appliedOutline: readonly StoryOutlineChapter[];
  canUndoOutline: boolean;
  chapterCount: number;
  chapterRange: [number, number];
  idea: string;
  onApplyChapterSections: (
    chapterNumber: number,
    sections: readonly StoryOutlineSection[],
  ) => boolean;
  onApplyOutline: (
    chapters: readonly StoryOutlineChapter[],
    range?: readonly [number, number],
  ) => boolean;
  onChangeChapterCount: (value: number) => void;
  onChangeChapterRange: (range: [number, number]) => void;
  onChangeWordsPerChapter: (value: number) => void;
  onEditIdea: () => void;
  onOpenChapter: () => void;
  onUpdateChapterOutline: (
    chapterNumber: number,
    changes: StoryOutlineEntry,
  ) => boolean;
  onUpdateSectionOutline: (
    chapterNumber: number,
    sectionIndex: number,
    changes: StoryOutlineEntry,
  ) => boolean;
  onUndoOutline: () => void;
  wordsPerChapter: number;
};

function formatChapterRange([start, end]: readonly [number, number]) {
  return start === end ? `第 ${start} 章` : `第 ${start}–${end} 章`;
}

function formatOutlineRange(chapters: readonly StoryOutlineChapter[]) {
  const start = chapters[0]?.chapterNumber;
  const end = chapters[chapters.length - 1]?.chapterNumber;

  return start && end ? formatChapterRange([start, end]) : '';
}

function formatMissingChapters(chapters: readonly number[]) {
  const visible = chapters.slice(0, 6).join('、');

  return chapters.length > 6
    ? `${visible} 等 ${chapters.length} 章`
    : visible;
}

export function OutlineStep({
  appliedOutline,
  canUndoOutline,
  chapterCount,
  chapterRange,
  idea,
  onApplyChapterSections,
  onApplyOutline,
  onChangeChapterCount,
  onChangeChapterRange,
  onChangeWordsPerChapter,
  onEditIdea,
  onOpenChapter,
  onUpdateChapterOutline,
  onUpdateSectionOutline,
  onUndoOutline,
  wordsPerChapter,
}: OutlineStepProps) {
  const theme = useTheme();
  const {
    activeGeneration,
    generateChapterSections,
    generateOutline,
    isReady,
    progress,
  } = useOutlineGenerator();
  const [preview, setPreview] =
    useState<OutlineGenerationResult | null>(null);
  const [sectionPreview, setSectionPreview] = useState<{
    chapterNumber: number;
    sections: readonly StoryOutlineSection[];
  } | null>(null);
  const [editorTarget, setEditorTarget] =
    useState<OutlineEditorTarget | null>(null);
  const isGenerating = activeGeneration !== null;
  const isGeneratingOutline = activeGeneration?.kind === 'outline';
  const generatingSectionsChapter =
    activeGeneration?.kind === 'sections'
      ? activeGeneration.chapterNumber
      : null;
  const rangeLabel = formatChapterRange(chapterRange);
  const selectedChapterCount = chapterRange[1] - chapterRange[0] + 1;
  const appliedChapters = appliedOutline.filter(
    (chapter) =>
      chapter.chapterNumber >= chapterRange[0] &&
      chapter.chapterNumber <= chapterRange[1],
  );
  const hasPreview = preview !== null && preview.chapters.length > 0;
  const outlineChapters = preview?.chapters ?? appliedChapters;
  const displayedChapters =
    !hasPreview && sectionPreview
      ? outlineChapters.map((chapter) =>
          chapter.chapterNumber === sectionPreview.chapterNumber
            ? { ...chapter, sections: sectionPreview.sections }
            : chapter,
        )
      : outlineChapters;
  const previewChapterCount = preview?.chapters.length ?? 0;
  const previewExpectedCount =
    preview?.expectedChapterNumbers.length ?? 0;
  const missingChapterNumbers = preview?.missingChapterNumbers ?? [];
  const displayRangeLabel = hasPreview
    ? formatOutlineRange(preview?.chapters ?? [])
    : rangeLabel;
  const canGenerate =
    idea.trim().length > 0 && isReady && !isGenerating;

  async function handleGenerateOutline() {
    try {
      const generated = await generateOutline({
        chapterCount,
        chapterRange,
        existingOutline: appliedOutline,
        idea,
        onPartialOutline(result) {
          setPreview(result);
        },
        wordsPerChapter,
      });

      if (generated) {
        setPreview(generated);
      }
    } catch (error) {
      Alert.alert(
        '无法生成故事大纲',
        error instanceof Error ? error.message : '请稍后重试',
      );
    }
  }

  function handleApplyOutline() {
    if (!preview || preview.chapters.length === 0 || isGenerating) {
      return;
    }

    const expectedStart = preview.expectedChapterNumbers[0];
    const expectedEnd =
      preview.expectedChapterNumbers[
        preview.expectedChapterNumbers.length - 1
      ];

    if (
      onApplyOutline(
        preview.chapters,
        expectedStart && expectedEnd
          ? [expectedStart, expectedEnd]
          : undefined,
      )
    ) {
      setPreview(null);
      return;
    }

    Alert.alert(
      '无法应用大纲',
      '生成范围已超出当前预计章数，请重新生成。',
    );
  }

  async function handleGenerateSections(
    chapterNumber: number,
    sectionCount: number,
  ) {
    setSectionPreview(null);

    try {
      const sections = await generateChapterSections({
        chapterCount,
        chapterNumber,
        existingOutline: appliedOutline,
        idea,
        onPartialSections(partialSections) {
          setSectionPreview({
            chapterNumber,
            sections: partialSections,
          });
        },
        sectionCount,
        wordsPerChapter,
      });

      if (!sections) {
        return;
      }

      if (!onApplyChapterSections(chapterNumber, sections)) {
        Alert.alert('无法应用节大纲', '请先生成该章大纲。');
        return;
      }

      if (sections.length < sectionCount) {
        Alert.alert(
          '节大纲未完整生成',
          `AI 返回了 ${sections.length}/${sectionCount} 节，可调整节数后重新生成。`,
        );
      }
    } catch (error) {
      Alert.alert(
        '无法生成节大纲',
        error instanceof Error ? error.message : '请稍后重试',
      );
    } finally {
      setSectionPreview(null);
    }
  }

  function handleEditChapter(chapterNumber: number) {
    if (hasPreview || isGenerating) {
      return;
    }

    const chapter = appliedOutline.find(
      (item) => item.chapterNumber === chapterNumber,
    );

    if (!chapter) {
      return;
    }

    setEditorTarget({
      chapterNumber: chapter.chapterNumber,
      kind: 'chapter',
      outline: chapter.outline,
      title: chapter.title,
    });
  }

  function handleEditSection(
    chapterNumber: number,
    sectionIndex: number,
  ) {
    if (hasPreview || isGenerating) {
      return;
    }

    const section = appliedOutline.find(
      (chapter) => chapter.chapterNumber === chapterNumber,
    )?.sections[sectionIndex];

    if (!section) {
      return;
    }

    setEditorTarget({
      chapterNumber,
      kind: 'section',
      outline: section.outline,
      sectionIndex,
      title: section.title,
    });
  }

  function handleSaveOutline(changes: StoryOutlineEntry) {
    if (!editorTarget) {
      return;
    }

    const updated =
      editorTarget.kind === 'chapter'
        ? onUpdateChapterOutline(editorTarget.chapterNumber, changes)
        : onUpdateSectionOutline(
            editorTarget.chapterNumber,
            editorTarget.sectionIndex,
            changes,
          );

    if (!updated) {
      Alert.alert(
        '无法保存大纲',
        '大纲内容已发生变化，请重新打开编辑。',
      );
      return;
    }

    setEditorTarget(null);
  }

  const generationLabel = isGeneratingOutline
    ? `正在生成 ${progress.completed}/${progress.total} 章`
    : generatingSectionsChapter
      ? `正在生成第 ${generatingSectionsChapter} 章的节大纲…`
      : '';

  return (
    <View style={styles.stepBody}>
      <View style={styles.intro}>
        <ThemedText type="subtitle" style={styles.introTitle}>
          故事大纲
        </ThemedText>
        <ThemedText type="small" style={styles.introCopy}>
          按范围生成章大纲，不自动生成节；展开章节后可指定节数生成。
        </ThemedText>
      </View>

      <Surface radius={Radius.control} style={styles.ideaPreview}>
        <View style={styles.ideaPreviewHeader}>
          <View
            style={[styles.statusDot, { backgroundColor: theme.accent }]}
          />
          <ThemedText type="smallBold" style={styles.ideaPreviewLabel}>
            你的故事
          </ThemedText>
          <Pressable
            accessibilityLabel="修改故事想法"
            accessibilityRole="button"
            accessibilityState={{ disabled: isGenerating }}
            disabled={isGenerating}
            hitSlop={8}
            onPress={onEditIdea}
            style={({ pressed }) => pressed && styles.pressed}>
            <ThemedText type="smallBold" themeColor="accent">
              修改
            </ThemedText>
          </Pressable>
        </View>
        <ThemedText numberOfLines={2} style={styles.ideaPreviewText}>
          {idea}
        </ThemedText>
      </Surface>

      <Surface radius={Radius.control} style={styles.planCard}>
        <View style={styles.planFields}>
          <View style={styles.planField}>
            <ScrubbableNumberField
              compact
              disabled={isGenerating}
              label="预计章数"
              max={MAX_CHAPTER_COUNT}
              maxLength={3}
              min={MIN_CHAPTER_COUNT}
              onChange={onChangeChapterCount}
              suffix="章"
              textStyle={styles.planInput}
              value={chapterCount}
            />
          </View>
          <View style={styles.planField}>
            <ScrubbableNumberField
              compact
              disabled={isGenerating}
              label="每章字数"
              max={MAX_WORDS_PER_CHAPTER}
              maxLength={5}
              min={MIN_WORDS_PER_CHAPTER}
              onChange={onChangeWordsPerChapter}
              step={100}
              suffix="字"
              textStyle={styles.planInput}
              value={wordsPerChapter}
            />
          </View>
        </View>

        <View
          style={[
            styles.divider,
            { backgroundColor: theme.backgroundSelected },
          ]}
        />

        <View style={styles.rangeSection}>
          <View style={styles.rangeHeader}>
            <View style={styles.rangeHeading}>
              <ThemedText type="smallBold" style={styles.rangeTitle}>
                生成范围
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {selectedChapterCount} 章
              </ThemedText>
            </View>
            <ThemedText type="smallBold" themeColor="accent">
              {rangeLabel}
            </ThemedText>
          </View>

          <View style={styles.rangeFields}>
            <View style={styles.planField}>
              <ScrubbableNumberField
                compact
                disabled={isGenerating}
                label="起始章"
                max={chapterRange[1]}
                maxLength={3}
                min={MIN_CHAPTER_COUNT}
                onChange={(value) =>
                  onChangeChapterRange([value, chapterRange[1]])
                }
                suffix="章"
                textStyle={styles.planInput}
                value={chapterRange[0]}
              />
            </View>
            <View style={styles.planField}>
              <ScrubbableNumberField
                compact
                disabled={isGenerating}
                label="结束章"
                max={chapterCount}
                maxLength={3}
                min={chapterRange[0]}
                onChange={(value) =>
                  onChangeChapterRange([chapterRange[0], value])
                }
                suffix="章"
                textStyle={styles.planInput}
                value={chapterRange[1]}
              />
            </View>
          </View>
        </View>
      </Surface>

      <Button
        align="between"
        disabled={!canGenerate}
        label={
          isGeneratingOutline
            ? '正在生成大纲…'
            : `${displayedChapters.length > 0 ? '重新生成' : '生成'}${rangeLabel}大纲`
        }
        loading={isGeneratingOutline}
        onPress={() => {
          void handleGenerateOutline();
        }}
        size="compact"
        trailingIcon={
          <SymbolView
            name={{ ios: 'sparkles', android: 'auto_awesome' }}
            size={15}
            tintColor={
              canGenerate ? theme.background : theme.textSecondary
            }
          />
        }
      />

      {isGenerating ? (
        <View style={styles.generatingStatus}>
          <ActivityIndicator color={theme.accent} size="small" />
          <ThemedText type="small" themeColor="textSecondary">
            {generationLabel}
          </ThemedText>
        </View>
      ) : null}

      {displayedChapters.length > 0 ? (
        <View style={styles.resultSection}>
          <View style={styles.resultHeader}>
            <View style={styles.resultHeading}>
              <ThemedText type="smallBold">
                {hasPreview ? '生成结果' : '当前大纲'}
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {hasPreview
                  ? `${displayRangeLabel} · 已解析 ${previewChapterCount}/${previewExpectedCount} 章`
                  : `已生成 ${appliedChapters.length}/${selectedChapterCount} 章`}
              </ThemedText>
            </View>
            <View style={styles.resultActions}>
              {hasPreview ? (
                <>
                  <Button
                    disabled={isGenerating}
                    label="撤销"
                    onPress={() => setPreview(null)}
                    size="compact"
                    variant="secondary"
                  />
                  <Button
                    disabled={isGenerating}
                    label={
                      previewChapterCount === previewExpectedCount
                        ? '应用'
                        : `应用 ${previewChapterCount} 章`
                    }
                    onPress={handleApplyOutline}
                    size="compact"
                  />
                </>
              ) : canUndoOutline ? (
                <Button
                  disabled={isGenerating}
                  label="撤销"
                  onPress={onUndoOutline}
                  size="compact"
                  variant="secondary"
                />
              ) : null}
            </View>
          </View>

          {hasPreview &&
          !isGenerating &&
          missingChapterNumbers.length > 0 ? (
            <ThemedText
              type="small"
              themeColor="textSecondary"
              style={styles.partialHint}>
              缺少章节：{formatMissingChapters(missingChapterNumbers)}
            </ThemedText>
          ) : null}

          <OutlinePreview
            chapters={displayedChapters}
            disabled={isGenerating}
            generatingSectionsChapter={generatingSectionsChapter}
            onEditChapter={
              hasPreview ? undefined : handleEditChapter
            }
            onEditSection={
              hasPreview ? undefined : handleEditSection
            }
            onGenerateSections={
              hasPreview
                ? undefined
                : (chapterNumber, sectionCount) => {
                    void handleGenerateSections(
                      chapterNumber,
                      sectionCount,
                    );
                  }
            }
          />
        </View>
      ) : !isGenerating ? (
        <View style={styles.emptyState}>
          <ThemedText type="small" themeColor="textSecondary">
            当前范围还没有生成大纲
          </ThemedText>
        </View>
      ) : null}

      <Button
        align="between"
        disabled={appliedOutline.length === 0 || isGenerating}
        label="进入章节内容"
        onPress={onOpenChapter}
        trailingIcon={
          <SymbolView
            name={{ ios: 'arrow.right', android: 'arrow_forward' }}
            size={16}
            tintColor={
              appliedOutline.length > 0 && !isGenerating
                ? theme.background
                : theme.textSecondary
            }
          />
        }
      />

      <OutlineEditorModal
        onClose={() => setEditorTarget(null)}
        onSave={handleSaveOutline}
        target={editorTarget}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  stepBody: {
    gap: 12,
  },
  intro: {
    gap: 2,
  },
  introTitle: {
    fontSize: 20,
    lineHeight: 26,
  },
  introCopy: {
    fontSize: 13,
    lineHeight: 18,
  },
  ideaPreview: {
    gap: 5,
    padding: 10,
  },
  ideaPreviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  ideaPreviewLabel: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  ideaPreviewText: {
    fontSize: 13,
    lineHeight: 19,
  },
  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  planCard: {
    gap: 9,
    padding: 9,
  },
  planFields: {
    flexDirection: 'row',
    gap: 8,
  },
  planField: {
    flex: 1,
  },
  planInput: {
    fontSize: 16,
    lineHeight: 20,
    fontWeight: 500,
    fontVariant: ['tabular-nums'],
  },
  divider: {
    height: StyleSheet.hairlineWidth,
  },
  rangeSection: {
    gap: 6,
  },
  rangeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  rangeHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rangeTitle: {
    fontSize: 13,
    lineHeight: 18,
  },
  rangeFields: {
    flexDirection: 'row',
    gap: 8,
  },
  generatingStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    paddingVertical: 4,
  },
  resultSection: {
    gap: 7,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  resultHeading: {
    flex: 1,
    gap: 1,
  },
  resultActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  partialHint: {
    fontSize: 11,
    lineHeight: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  pressed: {
    opacity: 0.62,
  },
});
