import {
  Pressable,
  StyleSheet,
  Text,
} from 'react-native';

import { TextField } from '@/components/ui/form';
import { Radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const IDEA_PLACEHOLDER =
  '例如：一名回到故乡的修复师，在旧宅的墙里发现一封写给自己的信……';

type IdeaEditorFieldProps = {
  addedIdea: string;
  displayedIdea: string;
  idea: string;
  isLocked: boolean;
  onChange: (value: string) => void;
  onStartEditing: () => void;
  onStopEditing: () => void;
  showEditor: boolean;
};

export function IdeaEditorField({
  addedIdea,
  displayedIdea,
  idea,
  isLocked,
  onChange,
  onStartEditing,
  onStopEditing,
  showEditor,
}: IdeaEditorFieldProps) {
  const theme = useTheme();

  return showEditor ? (
    <TextField
      accessibilityLabel="故事想法"
      autoFocus
      frameStyle={[
        styles.ideaFrame,
        {
          backgroundColor: theme.background,
          borderColor: theme.accent,
        },
      ]}
      multiline
      onBlur={onStopEditing}
      onChangeText={onChange}
      placeholder={IDEA_PLACEHOLDER}
      scrollEnabled={false}
      style={styles.ideaInput}
      textAlignVertical="top"
      value={idea}
    />
  ) : (
    <Pressable
      accessibilityHint={isLocked ? undefined : '点击编辑故事想法'}
      accessibilityRole="button"
      accessibilityState={{ disabled: isLocked }}
      disabled={isLocked}
      onPress={onStartEditing}
      style={({ pressed }) => [
        styles.ideaFrame,
        {
          backgroundColor: theme.background,
          borderColor: theme.backgroundSelected,
        },
        pressed && styles.pressed,
      ]}>
      {idea.length > 0 ? (
        <Text style={[styles.ideaInput, { color: theme.text }]}>
          {displayedIdea}
          {addedIdea ? (
            <Text style={{ color: theme.success }}>{addedIdea}</Text>
          ) : null}
        </Text>
      ) : (
        <Text
          style={[styles.ideaInput, { color: theme.textSecondary }]}>
          {IDEA_PLACEHOLDER}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  ideaFrame: {
    minHeight: 196,
    marginTop: 14,
    borderWidth: 1,
    borderRadius: Radius.control,
    paddingHorizontal: 14,
    alignItems: 'stretch',
  },
  ideaInput: {
    minHeight: 194,
    paddingVertical: 14,
    fontSize: 16,
    lineHeight: 25,
    fontWeight: 400,
    includeFontPadding: false,
  },
  pressed: {
    opacity: 0.62,
  },
});
