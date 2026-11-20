import { useState } from 'react';

import { HStack } from '@/components/gluestack/hstack';
import { Text } from '@/components/gluestack/text';
import { VStack } from '@/components/gluestack/vstack';
import { BottomSheetModal } from '@/components/ui/bottom-sheet-modal';
import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/form';
import { normalizeStoryTitle } from '@/features/stories/model/story-title';
import {
  MAX_STORY_TITLE_LENGTH,
  type StorySummary,
} from '@/features/stories/model/story-types';

type StoryNameEditorModalProps = {
  isSaving: boolean;
  onClose: () => void;
  onSave: (title: string) => void;
  story: StorySummary | null;
};

export function StoryNameEditorModal({
  isSaving,
  onClose,
  onSave,
  story,
}: StoryNameEditorModalProps) {
  return (
    <BottomSheetModal
      accessibilityLabel="关闭故事名称编辑"
      isOpen={story !== null}
      onClose={onClose}
      preventClose={isSaving}>
      {story ? (
        <StoryNameEditorSheet
          isSaving={isSaving}
          key={story.id}
          onClose={onClose}
          onSave={onSave}
          story={story}
        />
      ) : null}
    </BottomSheetModal>
  );
}

type StoryNameEditorSheetProps = {
  isSaving: boolean;
  onClose: () => void;
  onSave: (title: string) => void;
  story: StorySummary;
};

function StoryNameEditorSheet({
  isSaving,
  onClose,
  onSave,
  story,
}: StoryNameEditorSheetProps) {
  const [title, setTitle] = useState(story.title);
  const normalizedTitle = normalizeStoryTitle(title);
  const canSave =
    normalizedTitle.length > 0 &&
    normalizedTitle !== story.title &&
    !isSaving;

  function handleSave() {
    if (canSave) {
      onSave(normalizedTitle);
    }
  }

  return (
    <>
      <HStack className="items-center justify-between gap-3">
        <VStack className="flex-1 gap-0.5">
          <Text className="text-[17px] font-semibold leading-[22px] text-foreground">
            编辑故事名称
          </Text>
          <Text className="text-sm text-muted-foreground">
            长按故事可再次修改
          </Text>
        </VStack>
        <HStack className="gap-2">
          <Button
            disabled={isSaving}
            label="取消"
            onPress={onClose}
            size="compact"
            variant="secondary"
          />
          <Button
            disabled={!canSave}
            label="保存"
            loading={isSaving}
            onPress={handleSave}
            size="compact"
            variant="primary"
          />
        </HStack>
      </HStack>

      <TextField
        accessibilityLabel="故事名称"
        autoFocus
        maxLength={MAX_STORY_TITLE_LENGTH}
        onChangeText={setTitle}
        onSubmitEditing={handleSave}
        placeholder="输入故事名称"
        returnKeyType="done"
        selectTextOnFocus
        value={title}
      />
    </>
  );
}
