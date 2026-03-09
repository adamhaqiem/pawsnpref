import { describe, expect, it } from 'vitest';

import {
  buildCatImageUrl,
  normalizeCatRecords,
  type CataasCatRecord
} from './cataas';

describe('buildCatImageUrl', () => {
  it('builds a stable cat image URL from an id', () => {
    expect(buildCatImageUrl('abc123')).toBe('https://cataas.com/cat/abc123');
  });
});

describe('normalizeCatRecords', () => {
  it('maps valid Cataas records into app cards', () => {
    const records: CataasCatRecord[] = [
      {
        _id: 'cat-1',
        tags: ['sleepy', 'orange']
      }
    ];

    expect(normalizeCatRecords(records)).toEqual([
      {
        id: 'cat-1',
        imageUrl: 'https://cataas.com/cat/cat-1',
        thumbUrl: 'https://cataas.com/cat/cat-1?width=320',
        tags: ['sleepy', 'orange'],
        alt: 'Cat tagged sleepy, orange'
      }
    ]);
  });

  it('filters malformed records and falls back to a generic alt label', () => {
    const records: CataasCatRecord[] = [
      {
        _id: '',
        tags: ['missing-id']
      },
      {
        _id: 'cat-2',
        tags: 'not-an-array' as unknown as string[]
      },
      {
        _id: 'cat-3'
      }
    ];

    expect(normalizeCatRecords(records)).toEqual([
      {
        id: 'cat-2',
        imageUrl: 'https://cataas.com/cat/cat-2',
        thumbUrl: 'https://cataas.com/cat/cat-2?width=320',
        tags: [],
        alt: 'Cat photo'
      },
      {
        id: 'cat-3',
        imageUrl: 'https://cataas.com/cat/cat-3',
        thumbUrl: 'https://cataas.com/cat/cat-3?width=320',
        tags: [],
        alt: 'Cat photo'
      }
    ]);
  });
});
