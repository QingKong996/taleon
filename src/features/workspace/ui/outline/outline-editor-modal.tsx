import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
} from 'react-native';

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
    <Modal
      animationType="fade"
      onRequestClose={onClose}
      transparent
      visible={target !== null}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalRoot}>
        <Pressable
          accessibilityLabel="关闭大纲编辑"
          accessibilityRole="button"
          onPress={onClose}
          style={styles.modalBackdrop}
        />

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
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
});
