# Paws & Preferences Implementation Plan

> **For Codex in a new thread:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Before changing code, also load `test-driven-development` and `verification-before-completion`.

**Goal:** Finish the cat preference app as a mobile-first GitHub Pages SPA with swipe voting, a completion summary, and deployment-ready docs/workflow.

**Architecture:** The app is a static `Vite + React + TypeScript` SPA with all state held client-side. Cataas API fetching is isolated in `src/lib/cataas/cataas.ts`; the UI is currently centralized in `src/app/App.tsx` and should stay simple unless Session 2 extraction clearly improves the gesture/state flow.

**Tech Stack:** React 19, TypeScript, Vite, Vitest, Testing Library, GitHub Pages

---

## Read This First In Any New Thread

### Repository Snapshot
- Current branch target is `main`.
- Sessions 1, 2, and 3 are complete on `main`.
- The app now supports button voting, swipe voting, completion summary, restart flow, next-card preloading, and failed-image auto-skip handling.
- `README.md` and the Pages workflow reflect the deployed app behavior.

### Current Working Files
- [src/app/App.tsx](/c:/REPOS/pawsnfren/src/app/App.tsx): current app state and UI shell
- [src/app/App.css](/c:/REPOS/pawsnfren/src/app/App.css): current layout and card stack styling
- [src/lib/cataas/cataas.ts](/c:/REPOS/pawsnfren/src/lib/cataas/cataas.ts): API fetch + normalization
- [src/app/App.test.tsx](/c:/REPOS/pawsnfren/src/app/App.test.tsx): Session 1 UI tests
- [src/lib/cataas/cataas.test.ts](/c:/REPOS/pawsnfren/src/lib/cataas/cataas.test.ts): normalization tests
- [vite.config.ts](/c:/REPOS/pawsnfren/vite.config.ts): Pages base-path config
- [docs/plans/2026-03-09-paws-and-preferences-session-log.md](/c:/REPOS/pawsnfren/docs/plans/2026-03-09-paws-and-preferences-session-log.md): running handoff log

### Known Mismatches And Risks
- `origin` now points to `https://github.com/adamhaqiem/pawsnpref.git`, but [vite.config.ts](/c:/REPOS/pawsnfren/vite.config.ts) still sets `base: '/pawsnfren/'`. This must be corrected before GitHub Pages deployment.
- Cataas API payload shape is not stable enough to assume `_id` only. The adapter in [src/lib/cataas/cataas.ts](/c:/REPOS/pawsnfren/src/lib/cataas/cataas.ts) must continue accepting both `id` and `_id`, or the app will falsely fall into the “No cats are ready right now” state.
- Cataas browser access is assumed to work without auth. If a future thread sees CORS/network failures in-browser, stop and re-evaluate whether the app needs a fallback or a curated local list.

## Stable Product Decisions
- Keep the app static-only. No backend, no database, no login, no persistence across sessions.
- Continue using live Cataas data rather than a curated local image list.
- Keep the UI mobile-first and playful-clean rather than cloning Tinder literally.
- Keep the state local to the browser. Liked and disliked cards do not survive reloads.
- Prefer minimal dependencies. Do not add a swipe library unless custom pointer handling becomes clearly unworkable.
- Do not use git worktrees for this repo unless the user explicitly requests one. Future sessions should work in the main checkout.

## Existing Internal Types
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

If new internal state is needed in Session 2, add it deliberately rather than overloading `currentIndex`.

## Session Plan

### Session 1
Status: Complete

Delivered:
- Vite/React/TypeScript scaffold
- Cataas fetch + normalization
- Mobile-first stacked card layout
- Loading, error, retry, and empty states
- Initial tests and verified production build

Do not redo Session 1 unless a later task requires refactoring.

### Session 2
Status: Complete

#### Session 2 Outcome
Users can like or dislike cats by swiping left/right or by tapping explicit buttons. Each decision removes the top card, updates local liked/disliked arrays, and advances the deck. When no cards remain, the app shows a summary screen with liked count, liked gallery, and a restart action that fetches a fresh batch.

#### Session 2 Behavioral Spec
- The top card must be draggable on pointer-capable devices.
- Horizontal drag should move the card with visible `translateX`; small rotation tied to drag distance is required.
- Releasing below threshold should animate the card back to center.
- Releasing beyond threshold should animate the card out in the corresponding direction and commit the decision once.
- Button-triggered `Like` and `Dislike` must use the same decision pipeline as gesture-triggered voting.
- After a committed decision:
  - remove the previous top card from `remaining`
  - append that card to `liked` or `disliked`
  - update any `currentIndex` or equivalent state consistently
- When `remaining.length === 0` after a decision, show a completion summary instead of the deck.
- Summary screen must show:
  - total liked count
  - responsive gallery of liked cards
  - empty-liked copy if the user liked zero cats
  - restart button that fetches a fresh batch and resets deck state
- Session 1 placeholder copy about future swipe support must be removed.

#### Session 2 UI Constraints
- Keep the current visual direction and card stack base styling.
- Buttons must remain available as accessible fallback controls even after swipe is added.
- On narrow screens, the card should remain fully visible without horizontal overflow.
- Avoid over-animating. One clear drag transform + one clear accept/reject exit is enough.

#### Session 2 Suggested File Scope
- Modify: [src/app/App.tsx](/c:/REPOS/pawsnfren/src/app/App.tsx)
- Modify: [src/app/App.css](/c:/REPOS/pawsnfren/src/app/App.css)
- Modify: [src/features/deck/types.ts](/c:/REPOS/pawsnfren/src/features/deck/types.ts) if extra state types are needed
- Add or modify tests in [src/app/App.test.tsx](/c:/REPOS/pawsnfren/src/app/App.test.tsx)
- Optionally extract helpers/components under `src/features/deck/` only if it clearly improves readability

#### Session 2 Test-First Tasks
1. Write a failing test for button-driven `Like` moving the top card into `liked` and reducing remaining count.
2. Run `npm.cmd test -- src/app/App.test.tsx` or equivalent focused Vitest command and confirm failure for the correct reason.
3. Implement the minimum state transition code to pass.
4. Write a failing test for button-driven `Dislike`.
5. Verify red, implement minimal code, verify green.
6. Write a failing test for deck exhaustion showing the summary screen.
7. Verify red, implement summary UI, verify green.
8. Write a failing test for restart resetting state and fetching a new batch.
9. Verify red, implement restart flow, verify green.
10. Add focused tests for gesture threshold logic. If gesture logic is hard to test inline, extract pure helper functions and test them directly.

#### Session 2 Acceptance Criteria
- `Like` button works.
- `Dislike` button works.
- The deck advances exactly one card per decision.
- Summary appears only when the deck is exhausted, not for loading/error states.
- Restart returns the app to a fresh ready state with no prior likes/dislikes retained.
- Gesture and button decisions do not duplicate or conflict.
- Tests and build pass fresh.

### Session 3
Status: Complete

#### Session 3 Outcome
The app feels complete on mobile, handles image-loading failures more gracefully, documents how to run/deploy, and is ready for GitHub Pages hosting from the correct repository path.

#### Session 3 Behavioral Spec
- Preload the next card image once the current ready state is known.
- If an image fails to load, avoid a broken-image dead end:
  - either skip the failed card automatically
  - or show a clean fallback state inside the card and allow the user to continue
  - pick one approach and document it in the session log
- Refine stack spacing/animation so the top card remains visually dominant during transitions.
- Add README deployment instructions and app overview updates that match the final behavior.
- Add a GitHub Actions workflow or other repo-native Pages deployment path, but only after the Vite base path is corrected to match the current remote repository name.

#### Session 3 Required Fixes
- Update [vite.config.ts](/c:/REPOS/pawsnfren/vite.config.ts) `base` from `/pawsnfren/` to `/pawsnpref/` if GitHub Pages will be served from the current `origin` repo.
- Review all user-facing copy for outdated “coming in Session 2” text.
- Commit the currently untracked [README.md](/c:/REPOS/pawsnfren/README.md) if it still has not been committed yet.

#### Session 3 Suggested File Scope
- Modify: [src/app/App.tsx](/c:/REPOS/pawsnfren/src/app/App.tsx)
- Modify: [src/app/App.css](/c:/REPOS/pawsnfren/src/app/App.css)
- Modify or add tests in [src/app/App.test.tsx](/c:/REPOS/pawsnfren/src/app/App.test.tsx)
- Modify: [README.md](/c:/REPOS/pawsnfren/README.md)
- Modify: [vite.config.ts](/c:/REPOS/pawsnfren/vite.config.ts)
- Add: `.github/workflows/...` for Pages deployment if desired

#### Session 3 Test-First Tasks
1. Write a failing test around the chosen failed-image behavior, if the logic can be unit/integration tested without brittle DOM assumptions.
2. Verify red, implement minimal behavior, verify green.
3. Add tests covering the final summary rendering edge case for zero liked cats if not already covered in Session 2.
4. Add any remaining pure helper tests for gesture math or preload/fallback behavior.
5. Run full test suite and production build after the Pages base-path change.

#### Session 3 Acceptance Criteria
- No broken GitHub Pages base-path assumption remains.
- README reflects the final app rather than Session 1 only.
- Production build succeeds with the final base path.
- The app is usable on narrow mobile screens with no obvious layout breakage.
- The repo contains enough docs for another engineer to run, test, and deploy the project.

## Commands

### Install
```powershell
cmd /c "cd /d c:\REPOS\pawsnfren && npm.cmd install"
```

### Test
```powershell
cmd /c "cd /d c:\REPOS\pawsnfren && npm.cmd test"
```

### Build
```powershell
cmd /c "cd /d c:\REPOS\pawsnfren && npm.cmd run build"
```

### Dev Server
```powershell
cmd /c "cd /d c:\REPOS\pawsnfren && npm.cmd run dev"
```

If Vite/Vitest/esbuild fails under sandbox restrictions in a future thread, rerun the command with escalation rather than guessing.

## Required Verification Before Ending Any Session
- Run the relevant new tests during TDD red/green, not only at the end.
- Run the full `npm.cmd test` suite before claiming the session is complete.
- Run `npm.cmd run build` before claiming the session is complete.
- Update [docs/plans/2026-03-09-paws-and-preferences-session-log.md](/c:/REPOS/pawsnfren/docs/plans/2026-03-09-paws-and-preferences-session-log.md) with:
  - actual files changed
  - actual verification output summary
  - actual problems encountered
  - exact next-session starting point

## What A New Thread Should Do First
1. Read this file.
2. Read [docs/plans/2026-03-09-paws-and-preferences-session-log.md](/c:/REPOS/pawsnfren/docs/plans/2026-03-09-paws-and-preferences-session-log.md).
3. Run `git status --short --branch` and confirm whether `README.md` or any other files are uncommitted.
4. Stay in the main checkout unless the user explicitly asks for a separate branch or worktree.
5. Read the current implementation entry points listed above.
6. Continue with the next incomplete session only.
