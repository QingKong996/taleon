import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import type { StoryOutlineSection } from '@/features/workspace/model/workbench-data';

type OutlineSectionRowProps = {
  chapterNumber: number;
  disabled: boolean;
  index: number;
  onEdit?: (chapterNumber: number, sectionIndex: number) => void;
  section: StoryOutlineSection;
};

export function OutlineSectionRow({
  chapterNumber,
  disabled,
  index,
  onEdit,
  section,
}: OutlineSectionRowProps) {
  return (
    <View style={styles.section}>
      <View style={styles.heading}>
        <ThemedText
          type="smallBold"
          themeColor="accent"
          style={styles.number}>
          第 {index + 1} 节
        </ThemedText>
        <ThemedText
          numberOfLines={1}
          type="smallBold"
          style={styles.title}>
          {section.title}
        </ThemedText>
        {onEdit ? (
          <Pressable
            accessibilityLabel={`编辑第 ${chapterNumber} 章第 ${index + 1} 节`}
            accessibilityRole="button"
            accessibilityState={{ disabled }}
            disabled={disabled}
            hitSlop={8}
            onPress={() => onEdit(chapterNumber, index)}
            style={({ pressed }) => pressed && styles.pressed}>
            <ThemedText
              type="smallBold"
              themeColor={disabled ? 'textSecondary' : 'accent'}
              style={styles.edit}>
              编辑
            </ThemedText>
          </Pressable>
        ) : null}
      </View>
      <ThemedText
        type="small"
        themeColor="textSecondary"
        style={styles.outline}>
        {section.outline}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 2,
  },
  heading: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  number: {
    fontSize: 11,
    lineHeight: 15,
  },
  title: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
  },
  outline: {
    paddingLeft: 48,
    fontSize: 12,
    lineHeight: 18,
  },
  edit: {
    fontSize: 11,
    lineHeight: 15,
  },
  pressed: {
    opacity: 0.62,
  },
});
