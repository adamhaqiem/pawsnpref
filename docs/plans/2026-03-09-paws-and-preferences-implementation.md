# Paws & Preferences Plan And Session Handoff

## Summary
Build a static `Vite + React + TypeScript` SPA for GitHub Pages that fetches cat images from the Cataas API, presents them in a mobile-first swipe deck, records `like` and `dislike` decisions in client state, and ends with a summary gallery of liked cats.

Store two persistent planning artifacts in the repo:
- `docs/plans/2026-03-09-paws-and-preferences-implementation.md`
- `docs/plans/2026-03-09-paws-and-preferences-session-log.md`

## Public Interfaces And Core Types
- `CatCard`
  - `id: string`
  - `imageUrl: string`
  - `thumbUrl?: string`
  - `tags: string[]`
  - `alt: string`
- `SwipeDecision`
  - `'like' | 'dislike'`
- `DeckStatus`
  - `'loading' | 'ready' | 'error' | 'finished'`
- `DeckState`
  - `status`
  - `remaining`
  - `liked`
  - `disliked`
  - `currentIndex`
  - `errorMessage?: string`

These remain internal app types unless a later requirement introduces persistence or sharing.

## Session Breakdown
### Session 1: Foundation + API
- Scaffold `Vite + React + TypeScript`.
- Configure GitHub Pages base path and build output.
- Establish app shell, design tokens, and mobile-first layout.
- Add a Cataas client module that fetches a bounded list of cats and normalizes response data into `CatCard`.
- Render a stacked card UI from live API data.
- Include `loading`, `error`, `retry`, and `empty` states.
- End state: the app builds and loads a live cat deck, but swipe actions can still be button-only placeholders or non-functional visuals.

### Session 2: Swipe Loop + Summary
- Implement custom pointer/touch drag logic with threshold-based left/right decisions.
- Reuse the same decision path for explicit `Like` and `Dislike` buttons.
- Advance the deck after each decision and store liked/disliked cards in memory.
- Add the finished summary screen with liked count, liked gallery, and restart flow.
- End state: full required user flow works end to end.

### Session 3: Polish + Verification + Deploy
- Refine motion, stacking, and mobile ergonomics.
- Preload the next image and handle image-load failure gracefully.
- Add practical tests around normalization, deck transitions, and summary behavior.
- Add GitHub Pages deployment workflow and README usage/deployment notes.
- End state: public repo and hosted app are ready to submit.

## Session 1 Implementation Details
- Initialize the app with Vite React TypeScript template.
- Set `base` in Vite config to match the GitHub Pages repository name.
- Create a small source structure such as:
  - `src/app`
  - `src/components`
  - `src/features/deck`
  - `src/lib/cataas`
  - `src/styles`
- Build the Cataas adapter behind one module so API shape changes stay isolated.
- Fetch one batch on app start, normalize records, filter invalid entries, and keep a fixed working set of 10-12 cards.
- Render card stack visuals with the top card emphasized and next cards partially visible.
- Implement retry action for request failure and a friendly empty-state message if no usable cats are returned.

## Test Plan
- Session 1
  - Verify successful fetch maps into `CatCard[]`.
  - Verify malformed API entries are filtered out.
  - Verify loading, error, retry, and empty states render correctly.
- Session 2
  - Verify like/dislike decisions remove the top card and update the correct array.
  - Verify deck exhaustion transitions to summary.
  - Verify restart triggers a new fetch and resets state.
- Session 3
  - Verify production build succeeds with Pages base path.
  - Verify manual mobile behavior on narrow viewport for touch swipe, button fallback, and summary layout.

## Session Log Format
Maintain `docs/plans/2026-03-09-paws-and-preferences-session-log.md` with one section per session:

### Session N
- Goal:
- Changes made:
- Files added/modified:
- Verification performed:
- Problems faced:
- Resolutions or follow-ups:
- Next session starting point:

For Session 1 specifically, capture:
- Cataas endpoint and payload assumptions used
- Any CORS or image URL issues
- Any GitHub Pages base-path adjustments
- Any layout or mobile rendering problems discovered early

## Assumptions
- Static hosting only, no backend or persistence.
- Cataas API remains publicly accessible from the browser for the selected endpoint.
- The exercise prioritizes a reliable, polished demo over random infinite browsing.
- The repo currently has no scaffold, so Session 1 includes initial project setup in addition to feature work.
