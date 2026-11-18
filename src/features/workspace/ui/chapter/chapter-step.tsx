import { Host, Picker } from '@expo/ui';
import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  View,
} from 'react-native';

import { Button } from '@/components/ui/button';
import { Surface } from '@/components/ui/surface';
import { ThemedText } from '@/components/themed-text';
import { Radius } from '@/constants/theme';
import {
  getChapterContentBlockReason,
  hasSectionContent,
  isChapterContentComplete,
} from '@/features/workspace/model/content/chapter-content';
import {
  useChapterContentGenerator,
} from '@/features/workspace/model/content/use-chapter-content-generator';
import type { StoryOutlineChapter } from '@/features/workspace/model/workbench-data';
import {
  SectionContentCard,
} from '@/features/workspace/ui/chapter/section-content-card';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';

type ChapterStepProps = {
  chapterNumber: number;
  chapters: readonly StoryOutlineChapter[];
  idea: string;
  onApplySectionContent: (
    chapterNumber: number,
    sectionIndex: number,
    content: string,
  ) => boolean;
  onBackToOutline: () => void;
  onSelectChapter: (chapterNumber: number) => void;
  wordsPerChapter: number;
};

type StreamingContent = {
  chapterNumber: number;
  content: string;
  sectionIndex: number;
};

function getSectionProgress(chapter: StoryOutlineChapter) {
  return chapter.sections.filter(hasSectionContent).length;
}

export function ChapterStep({
  chapterNumber,
  chapters,
  idea,
  onApplySectionContent,
  onBackToOutline,
  onSelectChapter,
  wordsPerChapter,
}: ChapterStepProps) {
  const theme = useTheme();
  const colorScheme = useColorScheme();
  const { activeGeneration, generateSectionContent, isReady } =
    useChapterContentGenerator();
  const [streamingContent, setStreamingContent] =
    useState<StreamingContent | null>(null);
  const chapter =
    chapters.find((item) => item.chapterNumber === chapterNumber) ??
    chapters[0];
  const selectedChapterNumber = chapter?.chapterNumber ?? chapterNumber;
  const isGenerating = activeGeneration !== null;
  const blockReason = chapter
    ? getChapterContentBlockReason(chapters, chapter.chapterNumber)
    : null;
  const canGenerate =
    Boolean(chapter) && isReady && !isGenerating && !blockReason;

  async function handleGenerateSection(sectionIndex: number) {
    if (!chapter) {
      return;
    }

    if (blockReason) {
      Alert.alert('暂时无法生成正文', blockReason);
      return;
    }

    setStreamingContent({
      chapterNumber: chapter.chapterNumber,
      content: '',
      sectionIndex,
    });

    try {
      const content = await generateSectionContent({
        chapterNumber: chapter.chapterNumber,
        idea,
        onPartialContent(partialContent) {
          setStreamingContent({
            chapterNumber: chapter.chapterNumber,
            content: partialContent,
            sectionIndex,
          });
        },
        outline: chapters,
        sectionIndex,
        wordsPerChapter,
      });

      if (!content) {
        return;
      }

      if (
        !onApplySectionContent(
          chapter.chapterNumber,
          sectionIndex,
          content,
        )
      ) {
        Alert.alert(
          '无法保存正文',
          '章节状态已发生变化，请检查前文章节后重试。',
        );
      }
    } catch (error) {
      Alert.alert(
        '无法生成章节正文',
        error instanceof Error ? error.message : '请稍后重试',
      );
    } finally {
      setStreamingContent(null);
    }
  }

  return (
    <View style={styles.stepBody}>
      <View style={styles.intro}>
        <ThemedText type="subtitle" style={styles.introTitle}>
          章节内容
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          选择当前章，逐节生成正文；前文未完成时不会开放后续章节。
        </ThemedText>
      </View>

      {!chapter ? (
        <Surface radius={Radius.card} style={styles.emptyState}>
          <ThemedText type="smallBold">还没有章节大纲</ThemedText>
          <ThemedText
            type="small"
            themeColor="textSecondary"
            style={styles.emptyCopy}>
            请先返回故事大纲，生成章大纲并将章节拆分为节。
          </ThemedText>
          <Button
            label="返回大纲"
            onPress={onBackToOutline}
            size="compact"
            variant="secondary"
          />
        </Surface>
      ) : (
        <>
          <Surface radius={Radius.card} style={styles.pickerCard}>
            <View style={styles.pickerHeader}>
              <ThemedText type="smallBold">当前章</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                共 {chapters.length} 章
              </ThemedText>
            </View>
            <Host
              colorScheme={colorScheme}
              ignoreSafeArea="all"
              matchContents={{ vertical: true }}
              seedColor={theme.accent}
              style={styles.pickerHost}>
              <Picker
                accessibilityLabel="选择当前章节"
                enabled={!isGenerating}
                onValueChange={onSelectChapter}
                selectedValue={selectedChapterNumber}>
                {chapters.map((item) => {
                  const completedSections = getSectionProgress(item);
                  const progress =
                    isChapterContentComplete(item)
                      ? '已完成'
                      : `${completedSections}/${item.sections.length} 节`;

                  return (
                    <Picker.Item
                      key={item.chapterNumber}
                      label={`第 ${item.chapterNumber} 章 · ${item.title} · ${progress}`}
                      value={item.chapterNumber}
                    />
                  );
                })}
              </Picker>
            </Host>
          </Surface>

          <Surface radius={Radius.card} style={styles.chapterSummary}>
            <View style={styles.chapterSummaryHeader}>
              <View style={styles.chapterSummaryCopy}>
                <ThemedText type="smallBold">
                  第 {chapter.chapterNumber} 章 · {chapter.title}
                </ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {getSectionProgress(chapter)}/{chapter.sections.length} 节已完成
                </ThemedText>
              </View>
              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor: isChapterContentComplete(chapter)
                      ? theme.accentSoft
                      : theme.background,
                  },
                ]}>
                <ThemedText
                  type="smallBold"
                  themeColor={
                    isChapterContentComplete(chapter)
                      ? 'success'
                      : 'textSecondary'
                  }
                  style={styles.statusText}>
                  {isChapterContentComplete(chapter) ? '已完成' : '未完成'}
                </ThemedText>
              </View>
            </View>
            <ThemedText
              type="small"
              themeColor="textSecondary"
              style={styles.chapterOutline}>
              {chapter.outline}
            </ThemedText>
          </Surface>

          {blockReason ? (
            <Surface radius={Radius.control} style={styles.blockNotice}>
              <SymbolView
                name={{ ios: 'lock.fill', android: 'lock' }}
                size={16}
                tintColor={theme.textSecondary}
              />
              <ThemedText
                type="small"
                themeColor="textSecondary"
                style={styles.blockNoticeText}>
                {blockReason}
              </ThemedText>
            </Surface>
          ) : null}

          {isGenerating ? (
            <View style={styles.generatingStatus}>
              <ActivityIndicator color={theme.accent} size="small" />
              <ThemedText type="small" themeColor="textSecondary">
                正在生成第 {activeGeneration.chapterNumber} 章第{' '}
                {activeGeneration.sectionIndex + 1} 节…
              </ThemedText>
            </View>
          ) : null}

          <View style={styles.sectionList}>
            {chapter.sections.length > 0 ? (
              chapter.sections.map((section, sectionIndex) => {
                const isThisGenerating =
                  activeGeneration?.chapterNumber ===
                    chapter.chapterNumber &&
                  activeGeneration.sectionIndex === sectionIndex;
                const streamed =
                  streamingContent?.chapterNumber ===
                    chapter.chapterNumber &&
                  streamingContent.sectionIndex === sectionIndex
                    ? streamingContent.content
                    : null;

                return (
                  <SectionContentCard
                    content={streamed ?? section.content ?? ''}
                    disabled={!canGenerate}
                    generating={isThisGenerating}
                    index={sectionIndex}
                    key={`${chapter.chapterNumber}-${sectionIndex}`}
                    onGenerate={() => {
                      void handleGenerateSection(sectionIndex);
                    }}
                    section={section}
                  />
                );
              })
            ) : (
              <Surface radius={Radius.control} style={styles.emptyState}>
                <ThemedText type="smallBold">本章还没有节大纲</ThemedText>
                <ThemedText
                  type="small"
                  themeColor="textSecondary"
                  style={styles.emptyCopy}>
                  请返回故事大纲，为本章生成节大纲后再写正文。
                </ThemedText>
              </Surface>
            )}
          </View>

          <Button
            label="返回大纲"
            leadingIcon={
              <SymbolView
                name={{ ios: 'arrow.left', android: 'arrow_back' }}
                size={15}
                tintColor={theme.text}
              />
            }
            onPress={onBackToOutline}
            variant="secondary"
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  stepBody: {
    gap: 14,
  },
  intro: {
    gap: 2,
  },
  introTitle: {
    fontSize: 20,
    lineHeight: 26,
  },
  pickerCard: {
    gap: 6,
    padding: 12,
  },
  pickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  pickerHost: {
    width: '100%',
  },
  chapterSummary: {
    gap: 8,
    padding: 12,
  },
  chapterSummaryHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
  },
  chapterSummaryCopy: {
    flex: 1,
    gap: 2,
  },
  statusBadge: {
    borderRadius: Radius.pill,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  statusText: {
    fontSize: 11,
    lineHeight: 15,
  },
  chapterOutline: {
    fontSize: 13,
    lineHeight: 19,
  },
  blockNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    padding: 10,
  },
  blockNoticeText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
  },
  generatingStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    paddingVertical: 2,
  },
  sectionList: {
    gap: 10,
  },
  emptyState: {
    alignItems: 'center',
    gap: 8,
    padding: 18,
  },
  emptyCopy: {
    textAlign: 'center',
  },
});
