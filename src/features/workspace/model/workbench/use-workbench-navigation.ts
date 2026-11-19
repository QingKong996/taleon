import { useState } from 'react';

import type {
  WorkbenchSnapshot,
  WorkbenchStep,
} from '@/features/workspace/model/workbench-data';

export function useWorkbenchNavigation(
  initialSnapshot?: WorkbenchSnapshot,
) {
  const [step, setStep] = useState<WorkbenchStep>(
    initialSnapshot?.step ?? 0,
  );
  const [unlockedStep, setUnlockedStep] = useState<WorkbenchStep>(
    initialSnapshot?.unlockedStep ?? 0,
  );
  const [selectedChapter, setSelectedChapter] = useState(
    initialSnapshot?.selectedChapter ?? 1,
  );

  function goToStep(nextStep: WorkbenchStep) {
    if (nextStep <= unlockedStep) {
      setStep(nextStep);
    }
  }

  function advanceToStep(nextStep: WorkbenchStep) {
    setUnlockedStep(nextStep);
    setStep(nextStep);
  }

  function unlockStep(nextStep: WorkbenchStep) {
    setUnlockedStep((currentStep) =>
      nextStep > currentStep ? nextStep : currentStep,
    );
  }

  function restoreUnlockedStep(nextStep: WorkbenchStep) {
    setUnlockedStep(nextStep);
  }

  function resetForIdeaChange(resetSelection: boolean) {
    setStep(0);
    setUnlockedStep(0);

    if (resetSelection) {
      setSelectedChapter(1);
    }
  }

  return {
    advanceToStep,
    goToStep,
    resetForIdeaChange,
    restoreUnlockedStep,
    selectedChapter,
    setSelectedChapter,
    step,
    unlockStep,
    unlockedStep,
  };
}
