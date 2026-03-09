import { describe, expect, it } from 'vitest';

import { applyDecision, resolveSwipeDecision, SWIPE_EXIT_OFFSET_PX, SWIPE_THRESHOLD_PX } from './state';
import type { DeckState } from './types';

function createDeckState(overrides: Partial<DeckState> = {}): DeckState {
  return {
    status: 'ready',
    remaining: [
      {
        id: 'cat-1',
        imageUrl: 'https://cataas.com/cat/cat-1',
        thumbUrl: 'https://cataas.com/cat/cat-1?width=320',
        tags: ['fluffy'],
        alt: 'Cat tagged fluffy'
      },
      {
        id: 'cat-2',
        imageUrl: 'https://cataas.com/cat/cat-2',
        thumbUrl: 'https://cataas.com/cat/cat-2?width=320',
        tags: ['calico'],
        alt: 'Cat tagged calico'
      }
    ],
    liked: [],
    disliked: [],
    currentIndex: 0,
    ...overrides
  };
}

describe('applyDecision', () => {
  it('moves the top card into liked and advances the deck', () => {
    const nextDeck = applyDecision(createDeckState(), 'like');

    expect(nextDeck.status).toBe('ready');
    expect(nextDeck.remaining.map((card) => card.id)).toEqual(['cat-2']);
    expect(nextDeck.liked.map((card) => card.id)).toEqual(['cat-1']);
    expect(nextDeck.disliked).toEqual([]);
    expect(nextDeck.currentIndex).toBe(1);
    expect(nextDeck.finishedReason).toBeUndefined();
  });

  it('moves the top card into disliked and finishes the deck on the last card', () => {
    const nextDeck = applyDecision(
      createDeckState({
        remaining: [createDeckState().remaining[0]]
      }),
      'dislike'
    );

    expect(nextDeck.status).toBe('finished');
    expect(nextDeck.remaining).toEqual([]);
    expect(nextDeck.liked).toEqual([]);
    expect(nextDeck.disliked.map((card) => card.id)).toEqual(['cat-1']);
    expect(nextDeck.finishedReason).toBe('deck-complete');
  });
});

describe('resolveSwipeDecision', () => {
  it('returns null when the drag is below the swipe threshold', () => {
    expect(resolveSwipeDecision(SWIPE_THRESHOLD_PX - 1, SWIPE_THRESHOLD_PX)).toBeNull();
    expect(resolveSwipeDecision(-(SWIPE_THRESHOLD_PX - 1), SWIPE_THRESHOLD_PX)).toBeNull();
  });

  it('returns like or dislike once the threshold is met', () => {
    expect(resolveSwipeDecision(SWIPE_THRESHOLD_PX, SWIPE_THRESHOLD_PX)).toBe('like');
    expect(resolveSwipeDecision(-SWIPE_THRESHOLD_PX, SWIPE_THRESHOLD_PX)).toBe('dislike');
  });

  it('uses an exit offset that is larger than the commit threshold', () => {
    expect(SWIPE_EXIT_OFFSET_PX).toBeGreaterThan(SWIPE_THRESHOLD_PX);
  });
});
