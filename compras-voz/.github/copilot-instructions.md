# Project Instructions

## Context

Personal project for testing and learning. Expense tracking app with voice recording using React Native (Expo).

## Language

Always respond in Spanish.

## Workflow

- **Suggest before making changes.** When asked a question, explain concretely what would be done and why, and wait for confirmation before implementing.
- Do not apply changes automatically without the user requesting it.

## Architecture and organization

- Small, focused components. If a component exceeds ~100 lines, consider splitting it.
- Separate business logic from UI when possible (hooks, utils, services).
- Follow the current project structure:
  - `app/` — Only Expo Router routing files (1-line thin wrappers)
  - `screens/` — Full logic for each screen
  - `components/` — Reusable UI pieces
  - `services/` — Data access and business logic
  - `types/` — TypeScript types and interfaces
  - `hooks/` — Custom hooks
  - `constants/` — Static values and configuration

## Code style

- Strict TypeScript
- Use `@/` as alias for `src/`
- Prefer composition over monolithic components
