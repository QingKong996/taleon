import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/form';
import { ThemedText } from '@/components/themed-text';
import { Layout, Radius } from '@/constants/theme';
import type {
  StoryOutlineEntry,
} from '@/features/workspace/model/workbench-data';
import { useTheme } from '@/hooks/use-theme';

export type OutlineEditorTarget = StoryOutlineEntry &
  (
    | {
        chapterNumber: number;
        kind: 'chapter';
      }
    | {
        chapterNumber: number;
        kind: 'section';
        sectionIndex: number;
      }
  );

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

type OutlineEditorSheetProps = {
  onClose: () => void;
  onSave: (draft: StoryOutlineEntry) => void;
  target: OutlineEditorTarget;
};

function OutlineEditorSheet({
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
        styles.modalSheet,
        {
          backgroundColor: theme.backgroundElement,
          borderColor: theme.backgroundSelected,
          paddingBottom: insets.bottom + 16,
        },
      ]}>
      <View style={styles.modalHeader}>
        <View style={styles.modalHeading}>
          <ThemedText type="smallBold" style={styles.modalTitle}>
            {isSection ? '编辑节大纲' : '编辑章大纲'}
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {isSection
              ? `第 ${target.chapterNumber} 章 · 第 ${target.sectionIndex + 1} 节`
              : `第 ${target.chapterNumber} 章`}
          </ThemedText>
        </View>
        <View style={styles.modalHeaderActions}>
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
        contentContainerStyle={styles.modalFields}
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
  modalSheet: {
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
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalHeading: {
    flex: 1,
    gap: 2,
  },
  modalTitle: {
    fontSize: 17,
    lineHeight: 22,
  },
  modalHeaderActions: {
    flexDirection: 'row',
    gap: 8,
  },
  modalFields: {
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
