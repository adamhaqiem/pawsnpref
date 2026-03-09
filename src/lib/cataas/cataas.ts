import type { CatCard } from '../../features/deck/types';

export interface CataasCatRecord {
  _id?: string;
  tags?: string[] | unknown;
}

const CATAAS_API_URL = 'https://cataas.com/api/cats?skip=0&limit=20';

export function buildCatImageUrl(id: string, query?: string): string {
  const suffix = query ? `?${query}` : '';
  return `https://cataas.com/cat/${id}${suffix}`;
}

export function normalizeCatRecords(records: CataasCatRecord[]): CatCard[] {
  return records.flatMap((record) => {
    const id = typeof record._id === 'string' ? record._id.trim() : '';

    if (!id) {
      return [];
    }

    const tags = Array.isArray(record.tags)
      ? record.tags.filter((tag): tag is string => typeof tag === 'string' && tag.trim().length > 0)
      : [];

    const alt = tags.length > 0 ? `Cat tagged ${tags.join(', ')}` : 'Cat photo';

    return [
      {
        id,
        imageUrl: buildCatImageUrl(id),
        thumbUrl: buildCatImageUrl(id, 'width=320'),
        tags,
        alt
      }
    ];
  });
}

function shuffleCards(cards: CatCard[]): CatCard[] {
  const next = [...cards];

  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    const current = next[index];
    next[index] = next[swapIndex];
    next[swapIndex] = current;
  }

  return next;
}

export async function fetchCatCards(limit = 12, fetchImpl: typeof fetch = fetch): Promise<CatCard[]> {
  const response = await fetchImpl(CATAAS_API_URL);

  if (!response.ok) {
    throw new Error(`Cataas request failed with status ${response.status}`);
  }

  const payload = (await response.json()) as CataasCatRecord[];

  return shuffleCards(normalizeCatRecords(payload)).slice(0, limit);
}
