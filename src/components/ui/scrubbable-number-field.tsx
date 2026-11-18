import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  Keyboard,
  StyleSheet,
  View,
  type StyleProp,
  type TextStyle,
} from 'react-native';
import {
  Gesture,
  GestureDetector,
  type GestureStateChangeEvent,
  type GestureTouchEvent,
  type GestureUpdateEvent,
  type PanGestureHandlerEventPayload,
} from 'react-native-gesture-handler';

import { FormField, TextField } from '@/components/ui/form';
import { ThemedText } from '@/components/themed-text';
import { Radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type ScrubbableNumberFieldProps = {
  accessibilityLabel?: string;
  label: string;
  max: number;
  maxLength: number;
  min: number;
  onChange: (value: number) => void;
  pixelsPerStep?: number;
  step?: number;
  suffix: string;
  textStyle?: StyleProp<TextStyle>;
  value: number;
};

const LONG_PRESS_DURATION = 300;
const TAP_MAX_DISTANCE = 4;
const DEFAULT_PIXELS_PER_STEP = 12;
const ACCELERATION_STEP_COUNT = 10;
const FIELD_BACKGROUND = 'rgba(127, 127, 127, 0.12)';

function clamp(value: number, lower: number, upper: number) {
  return Math.min(Math.max(value, lower), upper);
}

function getScrubStepCount(translationY: number, pixelsPerStep: number) {
  const distance = Math.abs(translationY);
  const accelerationStart = pixelsPerStep * ACCELERATION_STEP_COUNT;
  const linearDistance = Math.min(distance, accelerationStart);
  const acceleratedDistance = Math.max(0, distance - accelerationStart);
  const stepCount = Math.floor(
    linearDistance / pixelsPerStep +
      acceleratedDistance / (pixelsPerStep / 2),
  );

  return translationY < 0 ? stepCount : -stepCount;
}

export function ScrubbableNumberField({
  accessibilityLabel,
  label,
  max,
  maxLength,
  min,
  onChange,
  pixelsPerStep = DEFAULT_PIXELS_PER_STEP,
  step = 1,
  suffix,
  textStyle,
  value,
}: ScrubbableNumberFieldProps) {
  const theme = useTheme();
  const [draft, setDraft] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const onChangeRef = useRef(onChange);
  const valueRef = useRef(value);
  const scrubStartValueRef = useRef(value);
  const scrubStartTranslationYRef = useRef(0);
  const tapStartRef = useRef<{
    time: number;
    x: number;
    y: number;
    moved: boolean;
  } | null>(null);
  const wasScrubbedRef = useRef(false);
  const limitsRef = useRef({ max, min });
  const tuningRef = useRef({ pixelsPerStep, step });

  useLayoutEffect(() => {
    valueRef.current = value;
  }, [value]);

  useLayoutEffect(() => {
    onChangeRef.current = onChange;
    limitsRef.current = { max, min };
    tuningRef.current = { pixelsPerStep, step };
  }, [max, min, onChange, pixelsPerStep, step]);

  const updateValue = useCallback((nextValue: number) => {
    const { max: currentMax, min: currentMin } = limitsRef.current;
    const normalizedValue = clamp(
      Math.round(nextValue),
      currentMin,
      currentMax,
    );

    if (normalizedValue !== valueRef.current) {
      valueRef.current = normalizedValue;
      onChangeRef.current(normalizedValue);
    }
  }, []);

  function commitDraft() {
    const parsed = Number(draft ?? value);
    const nextValue = Number.isFinite(parsed) ? parsed : value;

    setDraft(null);
    setIsEditing(false);
    updateValue(nextValue);
  }

  function updateDraft(text: string) {
    const digits = text.replace(/\D/g, '').slice(0, maxLength);

    setDraft(digits);

    if (!digits) {
      return;
    }

    const parsed = Number(digits);

    if (parsed >= min && parsed <= max) {
      updateValue(parsed);
    }
  }

  function adjustByStep(direction: -1 | 1) {
    const { step: currentStep } = tuningRef.current;

    updateValue(valueRef.current + direction * currentStep);
  }

  const handlePanStart = useCallback(
    (event: GestureStateChangeEvent<PanGestureHandlerEventPayload>) => {
      wasScrubbedRef.current = true;
      scrubStartValueRef.current = valueRef.current;
      scrubStartTranslationYRef.current = event.translationY;
      setIsScrubbing(true);
      Keyboard.dismiss();
    },
    [],
  );
  const handlePanUpdate = useCallback(
    (event: GestureUpdateEvent<PanGestureHandlerEventPayload>) => {
      const {
        pixelsPerStep: currentPixelsPerStep,
        step: currentStep,
      } = tuningRef.current;
      const stepCount = getScrubStepCount(
        event.translationY - scrubStartTranslationYRef.current,
        currentPixelsPerStep,
      );

      updateValue(
        scrubStartValueRef.current + stepCount * currentStep,
      );
    },
    [updateValue],
  );
  const handlePanFinalize = useCallback(
    (
      event: GestureStateChangeEvent<PanGestureHandlerEventPayload>,
      success: boolean,
    ) => {
      const start = tapStartRef.current;

      tapStartRef.current = null;
      setIsScrubbing(false);

      if (!success && start && !start.moved && !wasScrubbedRef.current) {
        if (
          Math.abs(event.translationY) <= TAP_MAX_DISTANCE &&
          Date.now() - start.time < LONG_PRESS_DURATION
        ) {
          setIsEditing(true);
        }
      }
    },
    [],
  );
  const handleTouchesDown = useCallback((event: GestureTouchEvent) => {
    const touch = event.changedTouches[0];

    wasScrubbedRef.current = false;
    tapStartRef.current =
      event.numberOfTouches === 1 && touch
        ? {
            time: Date.now(),
            x: touch.absoluteX,
            y: touch.absoluteY,
            moved: false,
          }
        : null;
  }, []);
  const handleTouchesMove = useCallback((event: GestureTouchEvent) => {
    const start = tapStartRef.current;
    const touch = event.changedTouches[0] ?? event.allTouches[0];

    if (!start || !touch || start.moved) {
      return;
    }

    start.moved =
      Math.hypot(
        touch.absoluteX - start.x,
        touch.absoluteY - start.y,
      ) > TAP_MAX_DISTANCE;
  }, []);
  const fieldGesture = useMemo(() => {
    /* eslint-disable react-hooks/refs -- Gesture callbacks run outside render. */
    const panGesture = Gesture.Pan()
      .activateAfterLongPress(LONG_PRESS_DURATION)
      .hitSlop(4)
      .shouldCancelWhenOutside(false)
      .runOnJS(true)
      .onTouchesDown(handleTouchesDown)
      .onTouchesMove(handleTouchesMove)
      .onStart(handlePanStart)
      .onUpdate(handlePanUpdate)
      .onFinalize(handlePanFinalize);
    /* eslint-enable react-hooks/refs */

    return panGesture;
  }, [
    handlePanFinalize,
    handlePanStart,
    handlePanUpdate,
    handleTouchesDown,
    handleTouchesMove,
  ]);

  const trailing = (
    <ThemedText type="small" themeColor="textSecondary">
      {suffix}
    </ThemedText>
  );

  if (isEditing) {
    return (
      <TextField
        accessibilityLabel={accessibilityLabel ?? label}
        autoFocus
        frameStyle={[styles.frame, { borderColor: theme.accent }]}
        keyboardType="number-pad"
        label={label}
        maxLength={maxLength}
        onBlur={commitDraft}
        onChangeText={updateDraft}
        onFocus={() => setDraft(String(value))}
        onSubmitEditing={commitDraft}
        returnKeyType="done"
        selectTextOnFocus
        style={textStyle}
        trailing={trailing}
        value={draft ?? String(value)}
      />
    );
  }

  return (
    <FormField label={label}>
      <GestureDetector gesture={fieldGesture}>
        <View
          accessibilityActions={[
            { name: 'increment', label: '增加' },
            { name: 'decrement', label: '减少' },
          ]}
          accessibilityHint="点击输入，长按后上下滑动调整"
          accessibilityLabel={accessibilityLabel ?? label}
          accessibilityRole="adjustable"
          accessibilityValue={{
            max,
            min,
            now: value,
            text: `${value}${suffix}`,
          }}
          onAccessibilityAction={(event) => {
            if (event.nativeEvent.actionName === 'increment') {
              adjustByStep(1);
            } else if (event.nativeEvent.actionName === 'decrement') {
              adjustByStep(-1);
            }
          }}>
          <View
            style={[
              styles.frame,
              styles.valueFrame,
              {
                backgroundColor: isScrubbing
                  ? theme.accentSoft
                  : FIELD_BACKGROUND,
                borderWidth: isScrubbing ? 1 : 0,
                borderColor: isScrubbing
                  ? theme.accent
                  : 'transparent',
              },
            ]}>
            <ThemedText style={[styles.value, textStyle]}>
              {value}
            </ThemedText>
            {trailing}
          </View>
        </View>
      </GestureDetector>
    </FormField>
  );
}

const styles = StyleSheet.create({
  frame: {
    borderWidth: 1,
    borderRadius: Radius.control,
    minHeight: 42,
  },
  valueFrame: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
  },
  value: {
    flex: 1,
    fontVariant: ['tabular-nums'],
  },
});
