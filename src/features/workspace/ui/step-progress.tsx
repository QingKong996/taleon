import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, View } from 'react-native';

import { Surface } from '@/components/ui/surface';
import { ThemedText } from '@/components/themed-text';
import { Radius } from '@/constants/theme';
import {
  WORKBENCH_STEPS,
  type WorkbenchStep,
} from '@/features/workspace/model/workbench-data';
import { useTheme } from '@/hooks/use-theme';

type StepProgressProps = {
  currentStep: WorkbenchStep;
  onStepPress: (step: WorkbenchStep) => void;
  unlockedStep: WorkbenchStep;
};

export function StepProgress({
  currentStep,
  onStepPress,
  unlockedStep,
}: StepProgressProps) {
  const theme = useTheme();

  return (
    <Surface
      accessibilityLabel={`创作步骤，当前第 ${currentStep + 1} 步，共 ${WORKBENCH_STEPS.length} 步`}
      radius={Radius.card}
      style={styles.stepper}>
      {WORKBENCH_STEPS.map((item) => {
        const isActive = item.step === currentStep;
        const isReached = item.step <= unlockedStep;
        const isComplete = isReached && !isActive;

        return (
          <View key={item.step} style={styles.stepItem}>
            {item.step > 0 ? (
              <View
                style={[
                  styles.stepTrack,
                  styles.stepTrackLeft,
                  {
                    backgroundColor: isReached
                      ? theme.accent
                      : theme.backgroundSelected,
                  },
                ]}
              />
            ) : null}
            {item.step < WORKBENCH_STEPS.length - 1 ? (
              <View
                style={[
                  styles.stepTrack,
                  styles.stepTrackRight,
                  {
                    backgroundColor:
                      unlockedStep >= item.step + 1
                        ? theme.accent
                        : theme.backgroundSelected,
                  },
                ]}
              />
            ) : null}

            <Pressable
              accessibilityLabel={`${item.label}${isComplete ? '，已完成' : ''}`}
              accessibilityRole="button"
              accessibilityState={{ disabled: !isReached, selected: isActive }}
              disabled={!isReached}
              onPress={() => onStepPress(item.step)}
              style={({ pressed }) => [
                styles.stepContent,
                pressed && isReached && styles.pressed,
              ]}>
              <View
                style={[
                  styles.stepCircle,
                  {
                    backgroundColor: isReached
                      ? theme.accent
                      : theme.background,
                    borderColor: isReached
                      ? theme.accent
                      : theme.backgroundSelected,
                  },
                ]}>
                {isComplete ? (
                  <SymbolView
                    name={{ ios: 'checkmark', android: 'check' }}
                    size={12}
                    tintColor={theme.background}
                  />
                ) : (
                  <ThemedText
                    type="smallBold"
                    style={[
                      styles.stepNumber,
                      {
                        color: isActive
                          ? theme.background
                          : theme.textSecondary,
                      },
                    ]}>
                    {item.step + 1}
                  </ThemedText>
                )}
              </View>
              <ThemedText
                type="small"
                themeColor={
                  isActive ? 'accent' : isReached ? 'text' : 'textSecondary'
                }
                style={[styles.stepLabel, isActive && styles.stepLabelActive]}>
                {item.label}
              </ThemedText>
            </Pressable>
          </View>
        );
      })}
    </Surface>
  );
}

const styles = StyleSheet.create({
  stepper: {
    flexDirection: 'row',
    paddingHorizontal: 4,
    overflow: 'hidden',
  },
  stepItem: {
    position: 'relative',
    flex: 1,
    alignItems: 'center',
  },
  stepTrack: {
    position: 'absolute',
    top: 24,
    height: 2,
  },
  stepTrackLeft: {
    left: 0,
    right: '50%',
  },
  stepTrackRight: {
    left: '50%',
    right: 0,
  },
  stepContent: {
    width: '100%',
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 8,
    zIndex: 1,
  },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumber: {
    fontSize: 12,
    lineHeight: 14,
    fontVariant: ['tabular-nums'],
  },
  stepLabel: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 15,
  },
  stepLabelActive: {
    fontWeight: 600,
  },
  pressed: {
    opacity: 0.62,
  },
});
