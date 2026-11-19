import { useCallback, useEffect, useRef } from 'react';
import { AppState } from 'react-native';

import type { WorkbenchSnapshot } from '@/features/workspace/model/workbench-data';
import {
  saveStoryDocument,
  type StoryDocument,
} from '@/features/stories/model/story-storage';

const AUTOSAVE_INTERVAL_MS = 400;

export function useStoryAutosave(
  story: StoryDocument,
  snapshot: WorkbenchSnapshot,
) {
  const storyRef = useRef(story);
  const latestSnapshotRef = useRef(snapshot);
  const lastQueuedSnapshotRef = useRef<WorkbenchSnapshot | null>(snapshot);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    storyRef.current = story;
  }, [story]);

  const flush = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    const nextSnapshot = latestSnapshotRef.current;

    if (
      !nextSnapshot ||
      lastQueuedSnapshotRef.current === nextSnapshot
    ) {
      return;
    }

    lastQueuedSnapshotRef.current = nextSnapshot;
    const nextStory: StoryDocument = {
      ...storyRef.current,
      ...nextSnapshot,
      updatedAt: Date.now(),
    };

    void saveStoryDocument(nextStory).catch(() => {
      if (lastQueuedSnapshotRef.current === nextSnapshot) {
        lastQueuedSnapshotRef.current = null;
      }
    });
  }, []);

  const scheduleFlush = useCallback(() => {
    if (timerRef.current) {
      return;
    }

    timerRef.current = setTimeout(flush, AUTOSAVE_INTERVAL_MS);
  }, [flush]);

  useEffect(() => {
    latestSnapshotRef.current = snapshot;
    scheduleFlush();
  }, [scheduleFlush, snapshot]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state !== 'active') {
        flush();
      }
    });

    return () => subscription.remove();
  }, [flush]);

  useEffect(() => () => flush(), [flush]);
}
