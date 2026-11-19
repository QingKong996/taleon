import { SymbolView } from 'expo-symbols';
import {
  ActivityIndicator,
  StyleSheet,
  View,
} from 'react-native';

import { Button } from '@/components/ui/button';
import { Surface } from '@/components/ui/surface';
import { ThemedText } from '@/components/themed-text';
import { Radius } from '@/constants/theme';
import type { StoryOutlineChapter } from '@/features/workspace/model/workbench-data';
import { ChapterEmptyState } from '@/features/workspace/ui/chapter/chapter-empty-state';
import { ChapterPickerCard } from '@/features/workspace/ui/chapter/chapter-picker-card';
import { ChapterSummaryCard } from '@/features/workspace/ui/chapter/chapter-summary-card';
import { SectionContentCard } from '@/features/workspace/ui/chapter/section-content-card';
import { useChapterContentWorkflow } from '@/features/workspace/ui/chapter/use-chapter-content-workflow';
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
  const workflow = useChapterContentWorkflow({
    chapterNumber,
    chapters,
    idea,
    onApplySectionContent,
    wordsPerChapter,
  });

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

      {!workflow.chapter ? (
        <ChapterEmptyState
          actionLabel="返回大纲"
          description="请先返回故事大纲，生成章大纲并将章节拆分为节。"
          onAction={onBackToOutline}
          radius={Radius.card}
          title="还没有章节大纲"
        />
      ) : (
        <>
          <ChapterPickerCard
            chapters={chapters}
            disabled={workflow.isGenerating}
            onSelectChapter={onSelectChapter}
            selectedChapterNumber={workflow.selectedChapterNumber}
          />

          <ChapterSummaryCard chapter={workflow.chapter} />

          {workflow.blockReason ? (
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
                {workflow.blockReason}
              </ThemedText>
            </Surface>
          ) : null}

          {workflow.isGenerating && workflow.activeGeneration ? (
            <View style={styles.generatingStatus}>
              <ActivityIndicator color={theme.accent} size="small" />
              <ThemedText type="small" themeColor="textSecondary">
                正在生成第 {workflow.activeGeneration.chapterNumber} 章第{' '}
                {workflow.activeGeneration.sectionIndex + 1} 节…
              </ThemedText>
            </View>
          ) : null}

          <View style={styles.sectionList}>
            {workflow.chapter.sections.length > 0 ? (
              workflow.chapter.sections.map(
                (section, sectionIndex) => {
                  const isThisGenerating =
                    workflow.activeGeneration?.chapterNumber ===
                      workflow.chapter?.chapterNumber &&
                    workflow.activeGeneration.sectionIndex ===
                      sectionIndex;
                  const streamed =
                    workflow.streamingContent?.chapterNumber ===
                      workflow.chapter?.chapterNumber &&
                    workflow.streamingContent.sectionIndex ===
                      sectionIndex
                      ? workflow.streamingContent.content
                      : null;

                  return (
                    <SectionContentCard
                      content={streamed ?? section.content ?? ''}
                      disabled={!workflow.canGenerate}
                      generating={isThisGenerating}
                      index={sectionIndex}
                      key={`${workflow.chapter?.chapterNumber}-${sectionIndex}`}
                      onGenerate={() => {
                        void workflow.generateSection(sectionIndex);
                      }}
                      section={section}
                    />
                  );
                },
              )
            ) : (
              <ChapterEmptyState
                description="请返回故事大纲，为本章生成节大纲后再写正文。"
                title="本章还没有节大纲"
              />
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
});
