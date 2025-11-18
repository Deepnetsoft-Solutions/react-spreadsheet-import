# react-spreadsheet-import Fork README

This fork is based on `UgnisSoftware/react-spreadsheet-import` and adds a small, merge-friendly
persistence extension. This document is for humans (and AIs) working on this repo.

## Project structure (quick notes)

- Main entry: `src/ReactSpreadsheetImport.tsx` exports the `ReactSpreadsheetImport` component.
- Global config/state is passed via `RsiProps` and `RsiContext` (see `src/types.ts`, `src/components/Providers.tsx`, and `src/hooks/useRsi.ts`).
- The step-based flow is implemented in `src/steps/Steps.tsx` and `src/steps/UploadFlow.tsx`.
- Column matching logic lives under `src/steps/MatchColumnsStep`.

## Persistence support

- `RsiProps` has an optional `onStepChange?: (state: StepState) => void` callback.
- `Steps` calls `onStepChange` in a `useEffect` whenever the internal `StepState` changes.
- This is the main extension point for implementing persistence in host apps
  (e.g. save `StepState` to localStorage and feed it back via `initialStepState`).

### LocalStorage helper

- `createLocalStorageStepPersistence(key: string)` is exported from the package.
- It returns `{ initialStepState, onStepChange, clear }`.
- It only persists serialisable steps (upload, selectHeader, matchColumns, validateData).

Example usage in an app:

```tsx
import {
  ReactSpreadsheetImport,
  createLocalStorageStepPersistence,
} from "react-spreadsheet-import"

const persistence = createLocalStorageStepPersistence("employee-import-v1")

export function EmployeeImportModal(props) {
  return (
    <ReactSpreadsheetImport
      {...props}
      initialStepState={persistence.initialStepState}
      onStepChange={persistence.onStepChange}
    />
  )
}
```

### Keeping this fork merge-friendly

- Core changes are minimal:
  - added `onStepChange` to `RsiProps` (`src/types.ts`)
  - wired `onStepChange` in `src/steps/Steps.tsx`
  - exported `createLocalStorageStepPersistence` in `src/index.ts`
- All persistence logic lives in new files (`src/persistence.ts`, tests, this doc),
  which reduces conflicts when pulling upstream.

Later sections should be updated whenever new major features (like persistence) are added.
