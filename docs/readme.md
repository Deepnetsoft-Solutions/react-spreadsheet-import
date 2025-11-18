# AI Notes for react-spreadsheet-import

This file is to understand the project structure and important design decisions.

- Main entry: `src/ReactSpreadsheetImport.tsx` exports the `ReactSpreadsheetImport` component.
- Global config/state is passed via `RsiProps` and `RsiContext` (see `src/types.ts`, `src/components/Providers.tsx`, and `src/hooks/useRsi.ts`).
- The step-based flow is implemented in `src/steps/Steps.tsx` and `src/steps/UploadFlow.tsx`.
- Column matching logic lives under `src/steps/MatchColumnsStep`.

## Persistence support

- `RsiProps` has an optional `onStepChange?: (state: StepState) => void` callback.
- `Steps` calls `onStepChange` in a `useEffect` whenever the internal `StepState` changes.
- This is the main extension point for implementing persistence in host apps
  (e.g. save `StepState` to localStorage and feed it back via `initialStepState`).

Later sections should be updated whenever new major features (like persistence) are added.
