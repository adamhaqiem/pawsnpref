export type SwipeDecision = 'like' | 'dislike';

export type DeckStatus = 'loading' | 'ready' | 'error' | 'finished';

export interface CatCard {
  id: string;
  imageUrl: string;
  thumbUrl?: string;
  tags: string[];
  alt: string;
}

export interface DeckState {
  status: DeckStatus;
  remaining: CatCard[];
  liked: CatCard[];
  disliked: CatCard[];
  currentIndex: number;
  errorMessage?: string;
}
