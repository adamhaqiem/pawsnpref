import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { App } from './App';

const originalFetch = globalThis.fetch;

describe('App', () => {
  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('renders a loading state before cats arrive', () => {
    globalThis.fetch = vi.fn(
      () =>
        new Promise(() => {
          return undefined;
        }),
    ) as typeof fetch;

    render(<App />);

    expect(screen.getByText(/finding cats/i)).toBeInTheDocument();
  });

  it('renders stacked cat cards after a successful fetch', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [
        { _id: 'cat-1', tags: ['fluffy'] },
        { _id: 'cat-2', tags: ['calico'] },
        { _id: 'cat-3', tags: [] }
      ]
    }) as typeof fetch;

    render(<App />);

    expect(await screen.findByText(/3 cats to rate/i)).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /cat tagged fluffy/i })).toHaveAttribute(
      'src',
      'https://cataas.com/cat/cat-1'
    );
    expect(screen.getAllByText(/swipe support lands in session 2/i).length).toBeGreaterThan(0);
  });

  it('shows a retry path when the request fails', async () => {
    const user = userEvent.setup();
    const fetchMock = vi
      .fn()
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [{ _id: 'cat-1', tags: [] }]
      });

    globalThis.fetch = fetchMock as typeof fetch;

    render(<App />);

    expect(await screen.findByText(/couldn't load cats/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /try again/i }));

    await waitFor(() => {
      expect(screen.getByText(/1 cat to rate/i)).toBeInTheDocument();
    });
  });

  it('shows an empty state when no usable cats are returned', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [{ tags: ['missing-id'] }]
    }) as typeof fetch;

    render(<App />);

    expect(await screen.findByText(/no cats are ready right now/i)).toBeInTheDocument();
  });
});
