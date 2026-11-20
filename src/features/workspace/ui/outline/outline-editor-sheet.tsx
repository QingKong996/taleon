import { useState } from 'react';
import { ScrollView } from 'react-native';

import { HStack } from '@/components/gluestack/hstack';
import { Text } from '@/components/gluestack/text';
import { VStack } from '@/components/gluestack/vstack';
import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/form';
import type { StoryOutlineEntry } from '@/features/workspace/model/workbench-data';
import type { OutlineEditorTarget } from '@/features/workspace/ui/outline/outline-editor-target';

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
  const [outline, setOutline] = useState(target.outline);
  const [title, setTitle] = useState(target.title);
  const isSection = target.kind === 'section';
  const canSave = title.trim().length > 0 && outline.trim().length > 0;

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
    <>
      <HStack className="items-center justify-between gap-3">
        <VStack className="flex-1 gap-0.5">
          <Text className="text-[17px] font-semibold leading-[22px] text-foreground">
            {isSection ? '编辑节大纲' : '编辑章大纲'}
          </Text>
          <Text className="text-sm text-muted-foreground">
            {isSection
              ? `第 ${target.chapterNumber} 章 · 第 ${target.sectionIndex + 1} 节`
              : `第 ${target.chapterNumber} 章`}
          </Text>
        </VStack>
        <HStack className="gap-2">
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
        </HStack>
      </HStack>

      <ScrollView
        className="max-h-full flex-shrink"
        contentContainerStyle={{ gap: 16 }}
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
          frameStyle={{ minHeight: 148, alignItems: 'stretch' }}
          label={isSection ? '节大纲' : '章大纲'}
          multiline
          onChangeText={setOutline}
          placeholder={isSection ? '输入本节剧情大纲' : '输入本章剧情大纲'}
          style={{ minHeight: 146, paddingTop: 10 }}
          textAlignVertical="top"
          value={outline}
        />
      </ScrollView>
    </>
  );
}
