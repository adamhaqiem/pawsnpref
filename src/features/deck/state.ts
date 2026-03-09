import type { DeckState, SwipeDecision } from './types';

export const SWIPE_THRESHOLD_PX = 110;
export const SWIPE_EXIT_OFFSET_PX = 180;
export const SWIPE_EXIT_DURATION_MS = 220;

export function applyDecision(deck: DeckState, decision: SwipeDecision): DeckState {
  const [currentCard, ...nextRemaining] = deck.remaining;

  if (!currentCard) {
    return deck;
  }

  return {
    ...deck,
    status: nextRemaining.length === 0 ? 'finished' : 'ready',
    remaining: nextRemaining,
    liked: decision === 'like' ? [...deck.liked, currentCard] : deck.liked,
    disliked: decision === 'dislike' ? [...deck.disliked, currentCard] : deck.disliked,
    currentIndex: deck.currentIndex + 1,
    finishedReason: nextRemaining.length === 0 ? 'deck-complete' : undefined,
    errorMessage: undefined
  };
}

export function resolveSwipeDecision(offsetX: number, threshold: number): SwipeDecision | null {
  if (offsetX >= threshold) {
    return 'like';
  }

  if (offsetX <= -threshold) {
    return 'dislike';
  }

  return null;
}
