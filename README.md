# Paws & Preferences

A mobile-first React + TypeScript app for quickly sorting live Cataas cats into likes and passes.
You can access it through https://adamhaqiem.github.io/pawsnpref/

https://github.com/user-attachments/assets/5b9e8850-b0ba-4fc9-b997-28fe332b26bd


## What It Does

- Fetches a fresh cat deck from Cataas
- Supports swipe voting and button voting through the same decision flow
- Shows a completion summary with the cats you liked
- Restarts into a new batch without persisting prior choices
- Preloads the next card image and auto-skips broken top-card images so the session keeps moving

## Tech Stack

- React
- TypeScript
- Vite
- Vitest
- Testing Library

## Scripts

Use `npm.cmd` in PowerShell if `npm` is blocked by execution policy.

- `npm.cmd install` - install dependencies
- `npm.cmd run dev` - start the dev server
- `npm.cmd test` - run tests
- `npm.cmd run build` - create a production build
- `npm.cmd run preview` - preview the production build

## Local Development

1. Run `npm.cmd install`.
2. Start the app with `npm.cmd run dev`.
3. Run the test suite with `npm.cmd test`.
4. Validate the production bundle with `npm.cmd run build`.

## Project Structure

- `src/app` - app shell and top-level UI
- `src/features/deck` - deck-related types and feature logic
- `src/lib/cataas` - Cataas API normalization and fetching
- `docs/plans` - implementation plan and session log

## Data Source

Cat images are sourced from [Cataas](https://cataas.com/).

## Deployment

GitHub Pages is configured to publish this app from the repository path `/pawsnpref/`.

1. In GitHub, open `Settings > Pages`.
2. Set `Source` to `GitHub Actions`.
3. Push to `main` or run the `Deploy Pages` workflow manually.
4. GitHub Actions will install dependencies, run `npm ci`, build the Vite app, and deploy `dist/` to Pages.

The production build uses the correct Vite base path for `https://adamhaqiem.github.io/pawsnpref/`.

## Notes

- The implementation plan lives in [docs/plans/2026-03-09-paws-and-preferences-implementation.md](/c:/REPOS/pawsnfren/docs/plans/2026-03-09-paws-and-preferences-implementation.md).
- The running session log lives in [docs/plans/2026-03-09-paws-and-preferences-session-log.md](/c:/REPOS/pawsnfren/docs/plans/2026-03-09-paws-and-preferences-session-log.md).
