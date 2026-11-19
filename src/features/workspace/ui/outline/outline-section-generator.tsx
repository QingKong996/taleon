import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { ScrubbableNumberField } from '@/components/ui/scrubbable-number-field';
import { ThemedText } from '@/components/themed-text';
import {
  MAX_SECTION_COUNT,
  MIN_SECTION_COUNT,
} from '@/features/workspace/model/workbench-data';
import { useTheme } from '@/hooks/use-theme';

type OutlineSectionGeneratorProps = {
  disabled: boolean;
  generating: boolean;
  hasSections: boolean;
  onChangeSectionCount: (value: number) => void;
  onGenerate: () => void;
  sectionCount: number;
};

export function OutlineSectionGenerator({
  disabled,
  generating,
  hasSections,
  onChangeSectionCount,
  onGenerate,
  sectionCount,
}: OutlineSectionGeneratorProps) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.generator,
        { borderTopColor: theme.backgroundSelected },
      ]}>
      <View style={styles.copy}>
        <ThemedText type="smallBold" style={styles.title}>
          节大纲
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {hasSections
            ? '按新的节数重新生成会覆盖现有节'
            : '将本章拆成有推进关系的节'}
        </ThemedText>
      </View>
      <View style={styles.actions}>
        <View style={styles.countField}>
          <ScrubbableNumberField
            compact
            disabled={disabled}
            label="节数"
            max={MAX_SECTION_COUNT}
            maxLength={2}
            min={MIN_SECTION_COUNT}
            onChange={onChangeSectionCount}
            suffix="节"
            value={sectionCount}
          />
        </View>
        <Button
          disabled={disabled}
          label={hasSections ? '重新生成' : '生成节'}
          loading={generating}
          onPress={onGenerate}
          size="compact"
          variant="soft"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  generator: {
    gap: 7,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 9,
  },
  copy: {
    gap: 1,
  },
  title: {
    fontSize: 12,
    lineHeight: 16,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 7,
  },
  countField: {
    width: 88,
  },
});
