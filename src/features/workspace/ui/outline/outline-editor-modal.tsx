import { BottomSheetModal } from '@/components/ui/bottom-sheet-modal';
import type { StoryOutlineEntry } from '@/features/workspace/model/workbench-data';
import { OutlineEditorSheet } from '@/features/workspace/ui/outline/outline-editor-sheet';
import type { OutlineEditorTarget } from '@/features/workspace/ui/outline/outline-editor-target';

type OutlineEditorModalProps = {
  onClose: () => void;
  onSave: (draft: StoryOutlineEntry) => void;
  target: OutlineEditorTarget | null;
};

export function OutlineEditorModal({
  onClose,
  onSave,
  target,
}: OutlineEditorModalProps) {
  return (
    <BottomSheetModal
      accessibilityLabel="关闭大纲编辑"
      isOpen={target !== null}
      onClose={onClose}>
      {target ? (
        <OutlineEditorSheet
          key={`${target.kind}-${target.chapterNumber}-${
            target.kind === 'section' ? target.sectionIndex : 0
          }`}
          onClose={onClose}
          onSave={onSave}
          target={target}
        />
      ) : null}
    </BottomSheetModal>
  );
}
