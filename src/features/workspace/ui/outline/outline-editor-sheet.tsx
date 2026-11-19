import { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/form';
import { ThemedText } from '@/components/themed-text';
import { Layout, Radius } from '@/constants/theme';
import type { StoryOutlineEntry } from '@/features/workspace/model/workbench-data';
import type { OutlineEditorTarget } from '@/features/workspace/ui/outline/outline-editor-target';
import { useTheme } from '@/hooks/use-theme';

type OutlineEditorSheetProps = {
  onClose: () => void;
  onSave: (draft: StoryOutlineEntry) => void;
  target: OutlineEditorTarget;
};

export function OutlineEditorSheet({
  onClose,
  onSave,
  target,
}: OutlineEditorSheetProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [outline, setOutline] = useState(target.outline);
  const [title, setTitle] = useState(target.title);
  const isSection = target.kind === 'section';
  const canSave =
    title.trim().length > 0 && outline.trim().length > 0;

  function handleSave() {
    if (!canSave) {
      return;
    }

    onSave({
      outline: outline.trim(),
      title: title.trim(),
    });
  }

  return (
    <View
      style={[
        styles.sheet,
        {
          backgroundColor: theme.backgroundElement,
          borderColor: theme.backgroundSelected,
          paddingBottom: insets.bottom + 16,
        },
      ]}>
      <View style={styles.header}>
        <View style={styles.heading}>
          <ThemedText type="smallBold" style={styles.title}>
            {isSection ? '编辑节大纲' : '编辑章大纲'}
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {isSection
              ? `第 ${target.chapterNumber} 章 · 第 ${target.sectionIndex + 1} 节`
              : `第 ${target.chapterNumber} 章`}
          </ThemedText>
        </View>
        <View style={styles.headerActions}>
          <Button
            label="取消"
            onPress={onClose}
            size="compact"
            variant="secondary"
          />
          <Button
            disabled={!canSave}
            label="保存"
            onPress={handleSave}
            size="compact"
            variant="primary"
          />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.fields}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <TextField
          autoFocus
          label={isSection ? '节名' : '章名'}
          onChangeText={setTitle}
          placeholder={isSection ? '输入节名' : '输入章名'}
          value={title}
        />
        <TextField
          frameStyle={styles.outlineFrame}
          label={isSection ? '节大纲' : '章大纲'}
          multiline
          onChangeText={setOutline}
          placeholder={
            isSection ? '输入本节剧情大纲' : '输入本章剧情大纲'
          }
          style={styles.outlineInput}
          textAlignVertical="top"
          value={outline}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  sheet: {
    width: '92%',
    maxWidth: 560,
    maxHeight: '88%',
    alignSelf: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.sheet,
    paddingHorizontal: Layout.formPadding,
    paddingTop: Layout.formPadding,
    gap: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  heading: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 17,
    lineHeight: 22,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  fields: {
    gap: 16,
  },
  outlineFrame: {
    minHeight: 148,
    alignItems: 'stretch',
  },
  outlineInput: {
    minHeight: 146,
    paddingTop: 10,
  },
});
