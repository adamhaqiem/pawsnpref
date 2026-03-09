import { useEffect, useRef, useState, type CSSProperties } from 'react';

import type { CatCard, DeckState, SwipeDecision } from '../features/deck/types';
import {
  applyDecision,
  resolveSwipeDecision,
  skipTopCard,
  SWIPE_EXIT_DURATION_MS,
  SWIPE_EXIT_OFFSET_PX,
  SWIPE_THRESHOLD_PX
} from '../features/deck/state';
import { fetchCatCards } from '../lib/cataas/cataas';
import './App.css';

const initialState: DeckState = {
  status: 'loading',
  remaining: [],
  liked: [],
  disliked: [],
  currentIndex: 0
};

function getCountLabel(count: number): string {
  return `${count} cat${count === 1 ? '' : 's'} to rate`;
}

function getLikedCountLabel(count: number): string {
  return `You liked ${count} cat${count === 1 ? '' : 's'}`;
}

function renderTags(tags: CatCard['tags']): string {
  return tags.length > 0 ? tags.join(' â€¢ ') : 'Fresh from Cataas';
}

export function App() {
  const [deck, setDeck] = useState<DeckState>(initialState);
  const [dragOffsetX, setDragOffsetX] = useState(0);
  const [activePointerId, setActivePointerId] = useState<number | null>(null);
  const [exitDecision, setExitDecision] = useState<SwipeDecision | null>(null);
  const dragStartXRef = useRef(0);
  const exitTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    void loadCats();

    return () => {
      if (exitTimeoutRef.current !== null) {
        window.clearTimeout(exitTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (deck.status !== 'ready') {
      return;
    }

    const nextCard = deck.remaining[1];

    if (!nextCard) {
      return;
    }

    const nextImage = new Image();
    nextImage.src = nextCard.imageUrl;
  }, [deck]);

  function resetInteractionState() {
    setDragOffsetX(0);
    setActivePointerId(null);
    setExitDecision(null);

    if (exitTimeoutRef.current !== null) {
      window.clearTimeout(exitTimeoutRef.current);
      exitTimeoutRef.current = null;
    }
  }

  async function loadCats() {
    resetInteractionState();

    setDeck((current) => ({
      ...current,
      status: 'loading',
      errorMessage: undefined
    }));

    try {
      const cats = await fetchCatCards();

      setDeck({
        status: cats.length === 0 ? 'finished' : 'ready',
        remaining: cats,
        liked: [],
        disliked: [],
        currentIndex: 0,
        finishedReason: cats.length === 0 ? 'empty-data' : undefined
      });
    } catch (error) {
      setDeck({
        ...initialState,
        status: 'error',
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  function commitDecision(decision: SwipeDecision) {
    if (deck.status !== 'ready' || deck.remaining.length === 0 || exitDecision) {
      return;
    }

    setActivePointerId(null);
    setExitDecision(decision);
    setDragOffsetX(decision === 'like' ? SWIPE_EXIT_OFFSET_PX : -SWIPE_EXIT_OFFSET_PX);

    exitTimeoutRef.current = window.setTimeout(() => {
      setDeck((current) => applyDecision(current, decision));
      setDragOffsetX(0);
      setExitDecision(null);
      exitTimeoutRef.current = null;
    }, SWIPE_EXIT_DURATION_MS);
  }

  function handleTopCardImageError(cardId: string) {
    if (deck.status !== 'ready' || exitDecision) {
      return;
    }

    resetInteractionState();
    setDeck((current) => skipTopCard(current, cardId));
  }

  function handlePointerDown(pointerId: number, clientX: number) {
    if (exitDecision || deck.status !== 'ready') {
      return;
    }

    dragStartXRef.current = clientX;
    setActivePointerId(pointerId);
    setDragOffsetX(0);
  }

  function handlePointerMove(pointerId: number, clientX: number) {
    if (pointerId !== activePointerId || exitDecision) {
      return;
    }

    setDragOffsetX(clientX - dragStartXRef.current);
  }

  function handlePointerRelease(pointerId: number) {
    if (pointerId !== activePointerId) {
      return;
    }

    setActivePointerId(null);

    const decision = resolveSwipeDecision(dragOffsetX, SWIPE_THRESHOLD_PX);

    if (decision) {
      commitDecision(decision);
      return;
    }

    setDragOffsetX(0);
  }

  const visibleCards = deck.remaining.slice(0, 3).reverse();
  const topCardRotation = Math.max(-18, Math.min(18, dragOffsetX / 12));
  const topCardStyle = {
    '--drag-x': `${dragOffsetX}px`,
    '--drag-rotate': `${topCardRotation}deg`,
    '--swipe-threshold': `${SWIPE_THRESHOLD_PX}px`
  } as CSSProperties;

  return (
    <main className="app-shell">
      <section className="hero">
        <p className="eyebrow">Paws &amp; Preferences</p>
        <h1>Find your favourite kitty.</h1>
        <p className="hero-copy">
          Swipe or tap through a live stack of Cataas cats and see which ones make your shortlist.
        </p>
      </section>

      {deck.status === 'loading' ? (
        <section className="status-panel" aria-live="polite">
          <h2>Finding cats...</h2>
          <p>Fetching a fresh stack from Cataas.</p>
        </section>
      ) : null}

      {deck.status === 'error' ? (
        <section className="status-panel" aria-live="polite">
          <h2>Couldn&apos;t load cats</h2>
          <p>{deck.errorMessage ?? 'The cat service is unavailable right now.'}</p>
          <button className="action action-primary" onClick={() => void loadCats()} type="button">
            Try again
          </button>
        </section>
      ) : null}

      {deck.status === 'finished' && deck.finishedReason === 'empty-data' ? (
        <section className="status-panel" aria-live="polite">
          <h2>No cats are ready right now</h2>
          <p>We filtered out this batch because it didn&apos;t contain usable image ids.</p>
          <button className="action action-primary" onClick={() => void loadCats()} type="button">
            Reload batch
          </button>
        </section>
      ) : null}

      {deck.status === 'finished' && deck.finishedReason === 'deck-complete' ? (
        <section className="status-panel summary-panel" aria-live="polite">
          <p className="deck-label">Session complete</p>
          <h2>{getLikedCountLabel(deck.liked.length)}</h2>
          <p>
            {deck.liked.length > 0
              ? 'Here are the cats that made your final shortlist.'
              : 'No favourites this round, but a new batch is one tap away.'}
          </p>

          {deck.liked.length > 0 ? (
            <div className="liked-gallery" aria-label="Liked cats">
              {deck.liked.map((card) => (
                <article key={card.id} className="liked-card">
                  <img className="liked-image" src={card.thumbUrl ?? card.imageUrl} alt={card.alt} />
                  <p>{renderTags(card.tags)}</p>
                </article>
              ))}
            </div>
          ) : (
            <p className="summary-empty">You didn&apos;t like any cats in this batch.</p>
          )}

          <button className="action action-primary" onClick={() => void loadCats()} type="button">
            Restart
          </button>
        </section>
      ) : null}

      {deck.status === 'ready' ? (
        <section className="deck-layout">
          <div className="deck-header">
            <div>
              <p className="deck-label">Live API deck</p>
              <h2>{getCountLabel(deck.remaining.length)}</h2>
            </div>
            <p className="deck-note">Swipe left to pass, swipe right to keep, or use the buttons.</p>
          </div>

          <div className="card-stack" aria-label="Cat cards">
            {visibleCards.map((card, index) => {
              const stackIndex = visibleCards.length - index - 1;
              const isTopCard = stackIndex === 0;
              const exitClass =
                isTopCard && exitDecision
                  ? exitDecision === 'like'
                    ? ' cat-card-exit-right'
                    : ' cat-card-exit-left'
                  : '';

              return (
                <article
                  key={card.id}
                  className={`cat-card${isTopCard ? ' cat-card-top' : ''}${exitClass}`}
                  onPointerCancel={
                    isTopCard ? (event) => handlePointerRelease(event.pointerId) : undefined
                  }
                  onPointerDown={
                    isTopCard
                      ? (event) => handlePointerDown(event.pointerId, event.clientX)
                      : undefined
                  }
                  onPointerMove={
                    isTopCard
                      ? (event) => handlePointerMove(event.pointerId, event.clientX)
                      : undefined
                  }
                  onPointerUp={isTopCard ? (event) => handlePointerRelease(event.pointerId) : undefined}
                  style={
                    {
                      '--stack-offset': `${stackIndex * 14}px`,
                      '--stack-scale': `${1 - stackIndex * 0.03}`,
                      '--stack-opacity': `${1 - stackIndex * 0.14}`,
                      ...(isTopCard ? topCardStyle : {})
                    } as CSSProperties
                  }
                >
                  <img
                    className="cat-image"
                    src={card.imageUrl}
                    alt={card.alt}
                    onError={isTopCard ? () => handleTopCardImageError(card.id) : undefined}
                  />
                  <div className="card-copy">
                    <p className="card-label">{isTopCard ? 'Up next' : 'On deck'}</p>
                    <h3>{card.alt}</h3>
                    <p>{renderTags(card.tags)}</p>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="action-row" aria-label="Vote controls">
            <button
              className="action action-muted"
              type="button"
              disabled={Boolean(exitDecision)}
              onClick={() => commitDecision('dislike')}
            >
              Dislike
            </button>
            <button
              className="action action-primary"
              type="button"
              disabled={Boolean(exitDecision)}
              onClick={() => commitDecision('like')}
            >
              Like
            </button>
          </div>
        </section>
      ) : null}
    </main>
  );
}
