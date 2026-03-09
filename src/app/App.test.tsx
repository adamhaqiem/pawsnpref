import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { App } from './App';

const originalFetch = globalThis.fetch;

describe('App', () => {
  afterEach(() => {
    cleanup();
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
    vi.spyOn(Math, 'random').mockReturnValue(0.99);

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
    expect(screen.getByText(/swipe left to pass, swipe right to keep/i)).toBeInTheDocument();
    expect(screen.queryByText(/swipe support lands in session 2/i)).not.toBeInTheDocument();
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

  it('likes the top cat and advances to the next card', async () => {
    const user = userEvent.setup();
    vi.spyOn(Math, 'random').mockReturnValue(0.99);

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [
        { _id: 'cat-1', tags: ['fluffy'] },
        { _id: 'cat-2', tags: ['calico'] },
        { _id: 'cat-3', tags: ['sleepy'] }
      ]
    }) as typeof fetch;

    render(<App />);

    expect(await screen.findByText(/3 cats to rate/i)).toBeInTheDocument();

    const firstImage = screen.getByRole('img', { name: /cat tagged fluffy/i });

    await user.click(screen.getByRole('button', { name: /^like$/i }));

    await waitFor(() => {
      expect(screen.getByText(/2 cats to rate/i)).toBeInTheDocument();
    });

    expect(firstImage).not.toBeInTheDocument();
    expect(screen.getByRole('img', { name: /cat tagged calico/i })).toBeInTheDocument();
  });

  it('dislikes the top cat and advances to the next card', async () => {
    const user = userEvent.setup();
    vi.spyOn(Math, 'random').mockReturnValue(0.99);

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [
        { _id: 'cat-1', tags: ['fluffy'] },
        { _id: 'cat-2', tags: ['calico'] },
        { _id: 'cat-3', tags: ['sleepy'] }
      ]
    }) as typeof fetch;

    render(<App />);

    expect(await screen.findByText(/3 cats to rate/i)).toBeInTheDocument();

    const firstImage = screen.getByRole('img', { name: /cat tagged fluffy/i });

    await user.click(screen.getByRole('button', { name: /^dislike$/i }));

    await waitFor(() => {
      expect(screen.getByText(/2 cats to rate/i)).toBeInTheDocument();
    });

    expect(firstImage).not.toBeInTheDocument();
    expect(screen.getByRole('img', { name: /cat tagged calico/i })).toBeInTheDocument();
  });

  it('shows a completion summary when the deck is exhausted', async () => {
    const user = userEvent.setup();

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [{ _id: 'cat-1', tags: ['fluffy'] }]
    }) as typeof fetch;

    render(<App />);

    expect(await screen.findByText(/1 cat to rate/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /^like$/i }));

    expect(await screen.findByText(/you liked 1 cat/i)).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /cat tagged fluffy/i })).toBeInTheDocument();
    expect(screen.queryByText(/no cats are ready right now/i)).not.toBeInTheDocument();
  });

  it('shows empty-liked copy when the user dislikes every cat', async () => {
    const user = userEvent.setup();

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [{ _id: 'cat-1', tags: ['fluffy'] }]
    }) as typeof fetch;

    render(<App />);

    expect(await screen.findByText(/1 cat to rate/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /^dislike$/i }));

    expect(await screen.findByText(/you liked 0 cats/i)).toBeInTheDocument();
    expect(screen.getByText(/you didn't like any cats in this batch/i)).toBeInTheDocument();
  });

  it('restarts with a fresh batch after the summary screen', async () => {
    const user = userEvent.setup();
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [{ _id: 'cat-1', tags: ['fluffy'] }]
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [{ _id: 'cat-2', tags: ['calico'] }]
      });

    globalThis.fetch = fetchMock as typeof fetch;

    render(<App />);

    expect(await screen.findByText(/1 cat to rate/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /^like$/i }));

    expect(await screen.findByText(/you liked 1 cat/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /restart/i }));

    expect(await screen.findByText(/1 cat to rate/i)).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /cat tagged calico/i })).toBeInTheDocument();
    expect(screen.queryByText(/you liked 1 cat/i)).not.toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
