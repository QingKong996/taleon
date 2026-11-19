import {
  MAX_STORY_TITLE_LENGTH,
  UNTITLED_STORY_TITLE,
  type StoryDocument,
} from '@/features/stories/model/story-types';

export function normalizeStoryTitle(value: string) {
  return value
    .trim()
    .replace(/\s+/g, ' ')
    .slice(0, MAX_STORY_TITLE_LENGTH);
}

export function getStoryTitle(idea: string) {
  const normalizedIdea = idea.trim().replace(/\s+/g, ' ');

  if (!normalizedIdea) {
    return UNTITLED_STORY_TITLE;
  }

  const firstSentence =
    normalizedIdea.split(/[。！？.!?]/)[0]?.trim() || normalizedIdea;

  return firstSentence.length > 18
    ? `${firstSentence.slice(0, 18)}…`
    : firstSentence;
}

export function getStoryDisplayTitle(
  story: Pick<StoryDocument, 'idea' | 'title'>,
) {
  return normalizeStoryTitle(story.title ?? '') || getStoryTitle(story.idea);
}
