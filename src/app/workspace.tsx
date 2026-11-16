import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { TabScrollView } from '@/components/tab-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';

const STEPS = [
  { step: 0, label: '故事想法' },
  { step: 1, label: '故事大纲' },
  { step: 2, label: '章节内容' },
] as const;

type WorkbenchStep = (typeof STEPS)[number]['step'];

type ChapterSection = {
  id: string;
  title: string;
  paragraphs: readonly string[];
};

type OutlineChapter = {
  id: string;
  title: string;
  beat: string;
  summary: string;
  paragraphs: readonly string[];
  sections?: readonly ChapterSection[];
};

const SAMPLE_IDEA =
  '终年不散的雾港里，年轻的修灯匠在雨夜收到一封来自失踪父亲的信。信上只有一个日期：三天后，会有一艘不该存在的船驶入港口。';

const OUTLINE_CHAPTERS: readonly OutlineChapter[] = [
  {
    id: 'letter',
    title: '雾里的来信',
    beat: '开端',
    summary: '灯塔在无风之夜熄灭，沈砚收到失踪十年的父亲寄来的信。信纸干燥，邮戳却来自明天。',
    paragraphs: [
      '雾是在凌晨四点漫进港口的。它越过防波堤，漫过石阶，最后停在修灯铺的窗沿下，像一群没有脚步声的访客。沈砚推开木门时，整条街只剩下潮湿的灯影。',
      '海崖上的灯塔已经熄了三个小时。自父亲失踪后，这是它第一次在夜里失去光亮。港务局说是线路故障，可沈砚知道，那盏灯用的不是电，而是一种连他也说不清的旧式燃料。',
      '信就放在柜台上。信封没有邮戳，纸却干燥得反常。沈砚拆开它，看见一行熟悉的字：“三天后，不要让那艘船进港。”落款处没有名字。但他认得父亲笔画末尾的习惯——每一竖，都会向左边轻轻一挑。',
    ],
  },
  {
    id: 'archive',
    title: '不存在的航线',
    beat: '发展',
    summary: '沈砚潜入港务档案馆，在废弃航线图上找到一艘没有船名的货轮，以及父亲留下的值班签名。',
    paragraphs: [
      '港务档案馆在地下二层，空气里长期漂着盐和旧纸的味道。沈砚借着手机微光，在废弃航线图上找到父亲的名字。那是一艘没有船名的货轮，抵达时间被红笔圈住：三天后，凌晨四点十七分。',
      '值班表上同样留着他的签名。可十年前的那一夜，父亲应该独自守在灯塔上。沈砚把两张纸并排放好，突然听见身后的铁门合拢。',
      '门外传来脚步声，很慢，停在他与出口之间。有人低声问：“你也收到信了？”',
    ],
  },
  {
    id: 'lighthouse',
    title: '灯塔之下',
    beat: '转折',
    summary: '地窖里的航海日志揭开真相：十年前熄灯的人正是父亲，而雾港一直隐瞒着那场沉船。',
    paragraphs: [
      '地窖的尽头亮着一盏煤油灯。灯下堆着父亲留下的航海日志，最后一页停在十年前的风暴夜：“四点十七分，我关了灯。船上的人不该靠岸。”',
      '沈砚往后翻，纸页却是空的。夹层里掉出一张泛黄的报纸，头版写着“雾港沉船事故，三十七人遇难”。报道的角落里，父亲的照片被红笔圈了两次。',
      '他终于明白，那不是一场意外。有人利用灯塔的黑暗把船引向礁石，而父亲选择了沉默十年。',
    ],
  },
  {
    id: 'last-light',
    title: '最后一束光',
    beat: '结局',
    summary: '风暴逼近，沈砚必须在公开真相与守住港口之间做出选择，并点亮父亲没能点亮的灯。',
    paragraphs: [
      '风暴在午夜前抵达。沈砚站在灯塔顶层，脚下是整座雾港。远处那艘没有船名的货轮正穿过防波堤，甲板上没有灯，只有一个模糊的人影抬头望着他。',
      '父亲的信在口袋里发烫。点亮灯塔，船会看见暗礁；熄灭它，沉船将再次发生。沈砚把手放在生锈的闸柄上，听见十年前的风声从金属里醒来。',
      '四点十七分，一束光切开浓雾。海面上，货轮缓缓转向。沈砚知道，天亮之后，雾港积压了十年的秘密将和他一起暴露在日光下。但至少这一次，没有人会沉进黑夜里。',
    ],
  },
];

export default function WorkspaceScreen() {
  const [step, setStep] = useState<WorkbenchStep>(0);
  const [unlockedStep, setUnlockedStep] = useState<WorkbenchStep>(0);
  const [idea, setIdea] = useState('');
  const [selectedChapter, setSelectedChapter] = useState(0);
  const [chapterSummaries, setChapterSummaries] = useState<string[]>(() =>
    OUTLINE_CHAPTERS.map((chapter) => chapter.summary),
  );

  const handleIdeaChange = (value: string) => {
    setIdea(value);

    if (unlockedStep > 0) {
      setUnlockedStep(0);
    }
  };

  const generateOutline = () => {
    if (!idea.trim()) {
      return;
    }

    setSelectedChapter(0);
    setChapterSummaries(OUTLINE_CHAPTERS.map((chapter) => chapter.summary));
    setUnlockedStep(1);
    setStep(1);
  };

  const generateChapter = () => {
    setUnlockedStep(2);
    setStep(2);
  };

  const openStep = (nextStep: WorkbenchStep) => {
    if (nextStep <= unlockedStep) {
      setStep(nextStep);
    }
  };

  const updateChapterSummary = (index: number, summary: string) => {
    setChapterSummaries((current) =>
      current.map((chapterSummary, chapterIndex) =>
        chapterIndex === index ? summary : chapterSummary,
      ),
    );
  };

  return (
    <TabScrollView key={step}>
      <View style={styles.header}>
        <ThemedText type="title">工作台</ThemedText>
        <StepProgress
          currentStep={step}
          unlockedStep={unlockedStep}
          onStepPress={openStep}
        />
      </View>

      {step === 0 ? (
        <IdeaStep
          idea={idea}
          onChangeIdea={handleIdeaChange}
          onGenerate={generateOutline}
        />
      ) : null}

      {step === 1 ? (
        <OutlineStep
          idea={idea}
          summaries={chapterSummaries}
          selectedChapter={selectedChapter}
          onChangeSummary={updateChapterSummary}
          onEditIdea={() => setStep(0)}
          onGenerateChapter={generateChapter}
          onSelectChapter={setSelectedChapter}
        />
      ) : null}

      {step === 2 ? (
        <ChapterStep
          chapterIndex={selectedChapter}
          onBackToOutline={() => setStep(1)}
          onSelectChapter={setSelectedChapter}
        />
      ) : null}
    </TabScrollView>
  );
}

type StepProgressProps = {
  currentStep: WorkbenchStep;
  unlockedStep: WorkbenchStep;
  onStepPress: (step: WorkbenchStep) => void;
};

function StepProgress({ currentStep, unlockedStep, onStepPress }: StepProgressProps) {
  const theme = useTheme();

  return (
    <View
      accessibilityLabel={`创作步骤，当前第 ${currentStep + 1} 步，共 ${STEPS.length} 步`}
      style={[
        styles.stepper,
        {
          backgroundColor: theme.backgroundElement,
          borderColor: theme.backgroundSelected,
        },
      ]}>
      {STEPS.map((item) => {
        const isActive = item.step === currentStep;
        const isReached = item.step <= unlockedStep;
        const isComplete = isReached && !isActive;

        return (
          <View key={item.step} style={styles.stepItem}>
            {item.step > 0 ? (
              <View
                style={[
                  styles.stepTrack,
                  styles.stepTrackLeft,
                  {
                    backgroundColor:
                      isReached ? theme.accent : theme.backgroundSelected,
                  },
                ]}
              />
            ) : null}
            {item.step < STEPS.length - 1 ? (
              <View
                style={[
                  styles.stepTrack,
                  styles.stepTrackRight,
                  {
                    backgroundColor:
                      unlockedStep >= item.step + 1
                        ? theme.accent
                        : theme.backgroundSelected,
                  },
                ]}
              />
            ) : null}

            <Pressable
              accessibilityLabel={`${item.label}${isComplete ? '，已完成' : ''}`}
              accessibilityRole="button"
              accessibilityState={{ disabled: !isReached, selected: isActive }}
              disabled={!isReached}
              onPress={() => onStepPress(item.step)}
              style={({ pressed }) => [
                styles.stepContent,
                pressed && isReached && styles.pressed,
              ]}>
              <View
                style={[
                  styles.stepCircle,
                  {
                    backgroundColor:
                      isReached ? theme.accent : theme.background,
                    borderColor:
                      isReached ? theme.accent : theme.backgroundSelected,
                  },
                ]}>
                {isComplete ? (
                  <SymbolView
                    name={{ ios: 'checkmark', android: 'check' }}
                    size={12}
                    tintColor={theme.background}
                  />
                ) : (
                  <ThemedText
                    type="smallBold"
                    style={[
                      styles.stepNumber,
                      { color: isActive ? theme.background : theme.textSecondary },
                    ]}>
                    {item.step + 1}
                  </ThemedText>
                )}
              </View>
              <ThemedText
                type="small"
                themeColor={isActive ? 'accent' : isReached ? 'text' : 'textSecondary'}
                style={[styles.stepLabel, isActive && styles.stepLabelActive]}>
                {item.label}
              </ThemedText>
            </Pressable>
          </View>
        );
      })}
    </View>
  );
}

type IdeaStepProps = {
  idea: string;
  onChangeIdea: (value: string) => void;
  onGenerate: () => void;
};

function IdeaStep({ idea, onChangeIdea, onGenerate }: IdeaStepProps) {
  const theme = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const canGenerate = idea.trim().length > 0;

  return (
    <View style={styles.stepBody}>
      <View style={styles.intro}>
        <ThemedText type="subtitle" style={styles.introTitle}>
          故事想法
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          描述人物、冲突和你想要营造的氛围。
        </ThemedText>
      </View>

      <View
        style={[
          styles.card,
          {
            backgroundColor: theme.backgroundElement,
            borderColor: theme.backgroundSelected,
          },
        ]}>
        <View style={styles.cardHeader}>
          <View style={[styles.iconTile, { backgroundColor: theme.accentSoft }]}>
            <SymbolView
              name={{ ios: 'lightbulb.fill', android: 'lightbulb' }}
              size={17}
              tintColor={theme.accent}
            />
          </View>
          <View style={styles.cardHeaderCopy}>
            <ThemedText type="smallBold">故事灵感</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              从一个画面、一句话或一个人物开始
            </ThemedText>
          </View>
        </View>

        <TextInput
          accessibilityLabel="故事想法"
          maxLength={800}
          multiline
          onBlur={() => setIsFocused(false)}
          onChangeText={onChangeIdea}
          onFocus={() => setIsFocused(true)}
          placeholder="例如：一名回到故乡的修复师，在旧宅的墙里发现一封写给自己的信……"
          placeholderTextColor={theme.textSecondary}
          scrollEnabled={false}
          selectionColor={theme.accent}
          style={[
            styles.ideaInput,
            {
              backgroundColor: theme.background,
              borderColor: isFocused ? theme.accent : theme.backgroundSelected,
              color: theme.text,
            },
          ]}
          textAlignVertical="top"
          value={idea}
        />

        <View style={styles.inputMeta}>
          <ThemedText type="small" themeColor="textSecondary">
            {idea.length} / 800
          </ThemedText>
          <Pressable
            accessibilityLabel="填入示例故事想法"
            accessibilityRole="button"
            hitSlop={8}
            onPress={() => onChangeIdea(SAMPLE_IDEA)}
            style={({ pressed }) => pressed && styles.pressed}>
            <ThemedText type="smallBold" themeColor="accent">
              填入示例
            </ThemedText>
          </Pressable>
        </View>
      </View>

      <PrimaryButton disabled={!canGenerate} label="生成故事大纲" onPress={onGenerate} />
    </View>
  );
}

type OutlineStepProps = {
  idea: string;
  summaries: readonly string[];
  selectedChapter: number;
  onChangeSummary: (index: number, summary: string) => void;
  onEditIdea: () => void;
  onGenerateChapter: () => void;
  onSelectChapter: (index: number) => void;
};

function OutlineStep({
  idea,
  summaries,
  selectedChapter,
  onChangeSummary,
  onEditIdea,
  onGenerateChapter,
  onSelectChapter,
}: OutlineStepProps) {
  const theme = useTheme();
  const [expandedChapter, setExpandedChapter] = useState<number | null>(selectedChapter);

  const toggleChapter = (index: number) => {
    const isExpanding = expandedChapter !== index;

    setExpandedChapter(isExpanding ? index : null);

    if (isExpanding) {
      onSelectChapter(index);
    }
  };

  return (
    <View style={styles.stepBody}>
      <View style={styles.intro}>
        <ThemedText type="subtitle" style={styles.introTitle}>
          故事大纲
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          展开章节编辑概要，选择一章生成正文。
        </ThemedText>
      </View>

      <View
        style={[
          styles.ideaPreview,
          {
            backgroundColor: theme.backgroundElement,
            borderColor: theme.backgroundSelected,
          },
        ]}>
        <View style={styles.ideaPreviewHeader}>
          <View style={[styles.statusDot, { backgroundColor: theme.accent }]} />
          <ThemedText type="smallBold" style={styles.ideaPreviewLabel}>
            你的故事
          </ThemedText>
          <Pressable
            accessibilityLabel="修改故事想法"
            accessibilityRole="button"
            hitSlop={8}
            onPress={onEditIdea}
            style={({ pressed }) => pressed && styles.pressed}>
            <ThemedText type="smallBold" themeColor="accent">
              修改
            </ThemedText>
          </Pressable>
        </View>
        <ThemedText numberOfLines={3} style={styles.ideaPreviewText}>
          {idea}
        </ThemedText>
      </View>

      <View style={styles.sectionHeader}>
        <ThemedText type="smallBold" style={styles.sectionLabel}>
          章节概要
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {OUTLINE_CHAPTERS.length} 章
        </ThemedText>
      </View>

      <View style={styles.outlineList}>
        {OUTLINE_CHAPTERS.map((chapter, index) => {
          const isSelected = selectedChapter === index;
          const isExpanded = expandedChapter === index;

          return (
            <View
              key={chapter.id}
              style={[
                styles.accordionCard,
                {
                  backgroundColor: isSelected ? theme.accentSoft : theme.backgroundElement,
                  borderColor: isSelected ? theme.accent : theme.backgroundSelected,
                },
              ]}>
              <Pressable
                accessibilityLabel={`第 ${index + 1} 章，${chapter.title}，${chapter.beat}，${
                  isExpanded ? '已展开' : '已折叠'
                }`}
                accessibilityRole="button"
                accessibilityState={{ expanded: isExpanded, selected: isSelected }}
                onPress={() => toggleChapter(index)}
                style={({ pressed }) => [
                  styles.accordionHeader,
                  pressed && styles.pressed,
                ]}>
                <View
                  style={[
                    styles.chapterNumber,
                    {
                      backgroundColor: isSelected ? theme.accent : theme.background,
                      borderColor: isSelected ? theme.accent : theme.backgroundSelected,
                    },
                  ]}>
                  <ThemedText
                    type="smallBold"
                    style={[
                      styles.chapterNumberText,
                      { color: isSelected ? theme.background : theme.textSecondary },
                    ]}>
                    {String(index + 1).padStart(2, '0')}
                  </ThemedText>
                </View>

                <View style={styles.outlineCopy}>
                  <View style={styles.outlineTitleRow}>
                    <ThemedText type="smallBold" style={styles.outlineTitle}>
                      {chapter.title}
                    </ThemedText>
                    <ThemedText
                      type="small"
                      themeColor={isSelected ? 'accent' : 'textSecondary'}
                      style={styles.outlineBeat}>
                      {chapter.beat}
                    </ThemedText>
                  </View>
                  {!isExpanded ? (
                    <ThemedText
                      type="small"
                      themeColor="textSecondary"
                      numberOfLines={1}
                      style={styles.outlineSummary}>
                      {summaries[index]}
                    </ThemedText>
                  ) : null}
                </View>

                <SymbolView
                  name={
                    isExpanded
                      ? { ios: 'chevron.up', android: 'keyboard_arrow_up' }
                      : { ios: 'chevron.down', android: 'keyboard_arrow_down' }
                  }
                  size={18}
                  tintColor={isSelected ? theme.accent : theme.textSecondary}
                />
              </Pressable>

              {isExpanded ? (
                <View
                  style={[
                    styles.accordionBody,
                    { borderTopColor: theme.backgroundSelected },
                  ]}>
                  <View style={styles.summaryHeader}>
                    <View style={styles.summaryLabelRow}>
                      <SymbolView
                        name={{ ios: 'pencil', android: 'edit' }}
                        size={13}
                        tintColor={theme.textSecondary}
                      />
                      <ThemedText type="smallBold" themeColor="textSecondary">
                        概要内容
                      </ThemedText>
                    </View>
                    <ThemedText type="small" themeColor="textSecondary">
                      {summaries[index].length} / 400
                    </ThemedText>
                  </View>

                  <TextInput
                    accessibilityLabel={`第 ${index + 1} 章概要`}
                    maxLength={400}
                    multiline
                    onChangeText={(summary) => onChangeSummary(index, summary)}
                    placeholder="写下本章的情节概要……"
                    placeholderTextColor={theme.textSecondary}
                    scrollEnabled={false}
                    selectionColor={theme.accent}
                    style={[
                      styles.summaryInput,
                      {
                        backgroundColor: theme.background,
                        borderColor: theme.backgroundSelected,
                        color: theme.text,
                      },
                    ]}
                    textAlignVertical="top"
                    value={summaries[index]}
                  />
                </View>
              ) : null}
            </View>
          );
        })}
      </View>

      <PrimaryButton
        label={`生成第 ${selectedChapter + 1} 章正文`}
        onPress={onGenerateChapter}
      />
    </View>
  );
}

type ChapterStepProps = {
  chapterIndex: number;
  onBackToOutline: () => void;
  onSelectChapter: (index: number) => void;
};

function ChapterStep({ chapterIndex, onBackToOutline, onSelectChapter }: ChapterStepProps) {
  const theme = useTheme();
  const chapter = OUTLINE_CHAPTERS[chapterIndex];
  const [expandedChapter, setExpandedChapter] = useState<number | null>(chapterIndex);

  const toggleChapter = (index: number) => {
    const isExpanding = expandedChapter !== index;

    setExpandedChapter(isExpanding ? index : null);

    if (isExpanding) {
      onSelectChapter(index);
    }
  };

  return (
    <View style={styles.stepBody}>
      <View style={styles.contentHeader}>
        <View style={styles.contentHeaderCopy}>
          <ThemedText type="subtitle" style={styles.introTitle}>
            章节内容
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            第 {chapterIndex + 1} 章 · {chapter.title}
          </ThemedText>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: theme.accentSoft }]}>
          <View style={[styles.statusDot, { backgroundColor: theme.accent }]} />
          <ThemedText type="smallBold" themeColor="accent" style={styles.statusText}>
            已生成
          </ThemedText>
        </View>
      </View>

      <View style={styles.outlineList}>
        {OUTLINE_CHAPTERS.map((item, index) => {
          const isSelected = index === chapterIndex;
          const isExpanded = expandedChapter === index;

          return (
            <View
              key={item.id}
              style={[
                styles.accordionCard,
                {
                  backgroundColor: isSelected ? theme.accentSoft : theme.backgroundElement,
                  borderColor: isSelected ? theme.accent : theme.backgroundSelected,
                },
              ]}>
              <Pressable
                accessibilityLabel={`第 ${index + 1} 章，${item.title}，${item.beat}，${
                  isExpanded ? '已展开' : '已折叠'
                }`}
                accessibilityRole="button"
                accessibilityState={{ expanded: isExpanded, selected: isSelected }}
                onPress={() => toggleChapter(index)}
                style={({ pressed }) => [
                  styles.accordionHeader,
                  pressed && styles.pressed,
                ]}>
                <View
                  style={[
                    styles.chapterNumber,
                    {
                      backgroundColor: isSelected ? theme.accent : theme.background,
                      borderColor: isSelected ? theme.accent : theme.backgroundSelected,
                    },
                  ]}>
                  <ThemedText
                    type="smallBold"
                    style={[
                      styles.chapterNumberText,
                      { color: isSelected ? theme.background : theme.textSecondary },
                    ]}>
                    {String(index + 1).padStart(2, '0')}
                  </ThemedText>
                </View>

                <View style={styles.outlineCopy}>
                  <View style={styles.outlineTitleRow}>
                    <ThemedText type="smallBold" style={styles.outlineTitle}>
                      {item.title}
                    </ThemedText>
                    <ThemedText
                      type="small"
                      themeColor={isSelected ? 'accent' : 'textSecondary'}
                      style={styles.outlineBeat}>
                      {item.beat}
                    </ThemedText>
                  </View>
                </View>

                <SymbolView
                  name={
                    isExpanded
                      ? { ios: 'chevron.up', android: 'keyboard_arrow_up' }
                      : { ios: 'chevron.down', android: 'keyboard_arrow_down' }
                  }
                  size={18}
                  tintColor={isSelected ? theme.accent : theme.textSecondary}
                />
              </Pressable>

              {isExpanded ? (
                <View
                  style={[
                    styles.accordionBody,
                    styles.readingAccordionBody,
                    { borderTopColor: theme.backgroundSelected },
                  ]}>
                  {item.paragraphs.length > 0 ? (
                    <View style={styles.paragraphList}>
                      {item.paragraphs.map((paragraph, paragraphIndex) => (
                        <ThemedText
                          key={`${item.id}-${paragraphIndex}`}
                          style={styles.paragraph}>
                          {paragraph}
                        </ThemedText>
                      ))}
                    </View>
                  ) : null}

                  {item.sections?.map((section, sectionIndex) => (
                    <View key={section.id} style={styles.chapterSection}>
                      <View style={styles.chapterSectionHeader}>
                        <ThemedText type="smallBold" themeColor="accent">
                          第 {sectionIndex + 1} 节
                        </ThemedText>
                        <ThemedText
                          type="smallBold"
                          style={styles.chapterSectionTitle}>
                          {section.title}
                        </ThemedText>
                      </View>

                      <View style={styles.paragraphList}>
                        {section.paragraphs.map((paragraph, paragraphIndex) => (
                          <ThemedText
                            key={`${section.id}-${paragraphIndex}`}
                            style={styles.paragraph}>
                            {paragraph}
                          </ThemedText>
                        ))}
                      </View>
                    </View>
                  ))}
                </View>
              ) : null}
            </View>
          );
        })}
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={onBackToOutline}
        style={({ pressed }) => [
          styles.secondaryButton,
          {
            backgroundColor: theme.backgroundElement,
            borderColor: theme.backgroundSelected,
          },
          pressed && styles.pressed,
        ]}>
        <SymbolView
          name={{ ios: 'arrow.left', android: 'arrow_back' }}
          size={15}
          tintColor={theme.text}
        />
        <ThemedText type="smallBold">返回大纲</ThemedText>
      </Pressable>
    </View>
  );
}

type PrimaryButtonProps = {
  disabled?: boolean;
  label: string;
  onPress: () => void;
};

function PrimaryButton({ disabled = false, label, onPress }: PrimaryButtonProps) {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.primaryButton,
        { backgroundColor: disabled ? theme.backgroundSelected : theme.accent },
        pressed && !disabled && styles.primaryButtonPressed,
      ]}>
      <ThemedText
        type="smallBold"
        style={[
          styles.primaryButtonText,
          { color: disabled ? theme.textSecondary : theme.background },
        ]}>
        {label}
      </ThemedText>
      <SymbolView
        name={{ ios: 'arrow.right', android: 'arrow_forward' }}
        size={16}
        tintColor={disabled ? theme.textSecondary : theme.background}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: 16,
  },
  stepper: {
    flexDirection: 'row',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 14,
    paddingHorizontal: 4,
    overflow: 'hidden',
  },
  stepItem: {
    position: 'relative',
    flex: 1,
    alignItems: 'center',
  },
  stepTrack: {
    position: 'absolute',
    top: 24,
    height: 2,
  },
  stepTrackLeft: {
    left: 0,
    right: '50%',
  },
  stepTrackRight: {
    left: '50%',
    right: 0,
  },
  stepContent: {
    width: '100%',
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 8,
    zIndex: 1,
  },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumber: {
    fontSize: 12,
    lineHeight: 14,
    fontVariant: ['tabular-nums'],
  },
  stepLabel: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 15,
  },
  stepLabelActive: {
    fontWeight: 600,
  },
  pressed: {
    opacity: 0.62,
  },
  stepBody: {
    gap: 18,
  },
  intro: {
    gap: 6,
  },
  introTitle: {
    fontSize: 24,
    lineHeight: 30,
  },
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 20,
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconTile: {
    width: 36,
    height: 36,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardHeaderCopy: {
    flex: 1,
    gap: 2,
  },
  ideaInput: {
    minHeight: 196,
    marginTop: 14,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 16,
    lineHeight: 25,
    fontWeight: 400,
  },
  inputMeta: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  primaryButton: {
    minHeight: 52,
    borderRadius: 16,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  primaryButtonPressed: {
    opacity: 0.84,
  },
  primaryButtonText: {
    fontSize: 15,
    lineHeight: 20,
  },
  ideaPreview: {
    gap: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 18,
    padding: 14,
  },
  ideaPreviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ideaPreviewLabel: {
    flex: 1,
  },
  ideaPreviewText: {
    fontSize: 15,
    lineHeight: 23,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 2,
  },
  sectionLabel: {
    fontSize: 13,
    lineHeight: 18,
  },
  outlineList: {
    gap: 8,
  },
  accordionCard: {
    borderWidth: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  accordionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
  },
  accordionBody: {
    gap: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
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
  outlineCopy: {
    flex: 1,
    gap: 3,
  },
  outlineTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  outlineTitle: {
    flex: 1,
  },
  outlineBeat: {
    fontSize: 12,
    lineHeight: 16,
  },
  outlineSummary: {
    lineHeight: 19,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  summaryLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  summaryInput: {
    minHeight: 96,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    lineHeight: 21,
    fontWeight: 400,
  },
  contentHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  contentHeaderCopy: {
    flex: 1,
    gap: 6,
  },
  statusBadge: {
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  statusText: {
    fontSize: 12,
    lineHeight: 16,
  },
  readingAccordionBody: {
    gap: 18,
    padding: 16,
  },
  chapterSection: {
    gap: 10,
  },
  chapterSectionHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  chapterSectionTitle: {
    flexShrink: 1,
  },
  paragraphList: {
    gap: 16,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 28,
    fontWeight: 400,
  },
  secondaryButton: {
    minHeight: 48,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
});
