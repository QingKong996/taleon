import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Surface } from '@/components/ui/surface';
import { ThemedText } from '@/components/themed-text';
import { Radius } from '@/constants/theme';
import type {
  StoryOutlineSection,
} from '@/features/workspace/model/workbench-data';
import { useTheme } from '@/hooks/use-theme';

type SectionContentCardProps = {
  content: string;
  disabled: boolean;
  generating: boolean;
  index: number;
  onGenerate: () => void;
  section: StoryOutlineSection;
};

export function SectionContentCard({
  content,
  disabled,
  generating,
  index,
  onGenerate,
  section,
}: SectionContentCardProps) {
  const theme = useTheme();
  const paragraphs = content
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
  const hasContent = content.trim().length > 0;

  return (
    <Surface
      radius={Radius.card}
      selected={generating}
      style={styles.card}>
      <View style={styles.header}>
        <View style={styles.heading}>
          <ThemedText type="smallBold" themeColor="accent">
            第 {index + 1} 节
          </ThemedText>
          <ThemedText type="smallBold" style={styles.title}>
            {section.title}
          </ThemedText>
        </View>
        <Button
          disabled={disabled}
          label={hasContent ? '重新生成' : '生成本节'}
          loading={generating}
          onPress={onGenerate}
          size="compact"
          variant={hasContent ? 'secondary' : 'soft'}
        />
      </View>

      <ThemedText
        type="small"
        themeColor="textSecondary"
        style={styles.outline}>
        {section.outline}
      </ThemedText>

      <View
        style={[
          styles.divider,
          { backgroundColor: theme.backgroundSelected },
        ]}
      />

      {paragraphs.length > 0 ? (
        <View style={styles.paragraphList}>
          {paragraphs.map((paragraph, paragraphIndex) => (
            <ThemedText
              key={paragraphIndex}
              style={styles.paragraph}>
              {paragraph}
            </ThemedText>
          ))}
        </View>
      ) : (
        <ThemedText type="small" themeColor="textSecondary">
          {generating ? '正在接收正文…' : '尚未生成本节正文'}
        </ThemedText>
      )}
    </Surface>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 10,
    padding: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  heading: {
    flex: 1,
    gap: 1,
  },
  title: {
    fontSize: 15,
    lineHeight: 20,
  },
  outline: {
    fontSize: 12,
    lineHeight: 18,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
  },
  paragraphList: {
    gap: 14,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 28,
    fontWeight: 400,
  },
});
