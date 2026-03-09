# Paws & Preferences

A small React + TypeScript web app for discovering which cats a user likes best.

## Current Status

Session 1 is implemented:
- Vite + React + TypeScript scaffold
- Live cat fetching from Cataas
- Mobile-first stacked card layout
- Loading, error, retry, and empty states

Session 2 and Session 3 are still pending:
- Swipe interactions and like/dislike flow
- Summary screen
- Deployment polish and GitHub Pages workflow

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

## Project Structure

- `src/app` - app shell and top-level UI
- `src/features/deck` - deck-related types and feature logic
- `src/lib/cataas` - Cataas API normalization and fetching
- `docs/plans` - implementation plan and session log

## Data Source

Cat images are sourced from [Cataas](https://cataas.com/).

## Notes

- The current Vite base path is configured for GitHub Pages deployment.
- The implementation plan lives in [docs/plans/2026-03-09-paws-and-preferences-implementation.md](/c:/REPOS/pawsnfren/docs/plans/2026-03-09-paws-and-preferences-implementation.md).
- The running session log lives in [docs/plans/2026-03-09-paws-and-preferences-session-log.md](/c:/REPOS/pawsnfren/docs/plans/2026-03-09-paws-and-preferences-session-log.md).
