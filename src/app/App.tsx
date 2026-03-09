import { useEffect, useState, type CSSProperties } from 'react';

import type { CatCard, DeckState } from '../features/deck/types';
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

function renderTags(tags: CatCard['tags']): string {
  return tags.length > 0 ? tags.join(' • ') : 'Fresh from Cataas';
}

export function App() {
  const [deck, setDeck] = useState<DeckState>(initialState);

  useEffect(() => {
    void loadCats();
  }, []);

  async function loadCats() {
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
        currentIndex: 0
      });
    } catch (error) {
      setDeck({
        ...initialState,
        status: 'error',
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  const visibleCards = deck.remaining.slice(0, 3).reverse();

  return (
    <main className="app-shell">
      <section className="hero">
        <p className="eyebrow">Paws &amp; Preferences</p>
        <h1>Find your favourite kitty.</h1>
        <p className="hero-copy">
          Session 1 wires the live cat feed, stacked cards, and mobile-first shell. Swipe support
          lands in Session 2.
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

      {deck.status === 'finished' ? (
        <section className="status-panel" aria-live="polite">
          <h2>No cats are ready right now</h2>
          <p>We filtered out this batch because it didn&apos;t contain usable image ids.</p>
          <button className="action action-primary" onClick={() => void loadCats()} type="button">
            Reload batch
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
            <p className="deck-note">Swipe support lands in Session 2.</p>
          </div>

          <div className="card-stack" aria-label="Cat cards">
            {visibleCards.map((card, index) => {
              const stackIndex = visibleCards.length - index - 1;
              const isTopCard = stackIndex === 0;

              return (
                <article
                  key={card.id}
                  className={`cat-card${isTopCard ? ' cat-card-top' : ''}`}
                  style={
                    {
                      '--stack-offset': `${stackIndex * 14}px`,
                      '--stack-scale': `${1 - stackIndex * 0.04}`,
                      '--stack-opacity': `${1 - stackIndex * 0.18}`
                    } as CSSProperties
                  }
                >
                  <img className="cat-image" src={card.imageUrl} alt={card.alt} />
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
            <button className="action action-muted" type="button" disabled>
              Dislike
            </button>
            <button className="action action-primary" type="button" disabled>
              Like
            </button>
          </div>
        </section>
      ) : null}
    </main>
  );
}
