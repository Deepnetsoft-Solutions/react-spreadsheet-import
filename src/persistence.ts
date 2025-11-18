import { StepType } from "./steps/UploadFlow"
import type { StepState } from "./steps/UploadFlow"
import type { RawData } from "./types"

export type SerializableStepState =
  | { type: StepType.upload }
  | { type: StepType.selectHeader; data: RawData[] }
  | { type: StepType.matchColumns; data: RawData[]; headerValues: RawData }
  | { type: StepType.validateData; data: any[] }

const toSerializable = (state: StepState): SerializableStepState | null => {
  switch (state.type) {
    case StepType.upload:
      return { type: StepType.upload }
    case StepType.selectSheet:
      return null
    case StepType.selectHeader:
      return { type: StepType.selectHeader, data: state.data }
    case StepType.matchColumns:
      return { type: StepType.matchColumns, data: state.data, headerValues: state.headerValues }
    case StepType.validateData:
      return { type: StepType.validateData, data: state.data }
    default:
      return null
  }
}

const fromSerializable = (serializable: SerializableStepState): StepState => {
  switch (serializable.type) {
    case StepType.upload:
      return { type: StepType.upload }
    case StepType.selectHeader:
      return { type: StepType.selectHeader, data: serializable.data }
    case StepType.matchColumns:
      return {
        type: StepType.matchColumns,
        data: serializable.data,
        headerValues: serializable.headerValues,
      }
    case StepType.validateData:
      return {
        type: StepType.validateData,
        data: serializable.data,
      }
    default:
      return { type: StepType.upload }
  }
}

export type LocalStorageStepPersistence = {
  initialStepState?: StepState
  onStepChange: (state: StepState) => void
  clear: () => void
}

export const createLocalStorageStepPersistence = (key: string): LocalStorageStepPersistence => {
  const load = (): StepState | undefined => {
    if (typeof window === "undefined") return undefined
    try {
      const raw = window.localStorage.getItem(key)
      if (!raw) return undefined
      const parsed = JSON.parse(raw) as SerializableStepState
      if (!parsed || typeof parsed.type === "undefined") return undefined
      return fromSerializable(parsed)
    } catch {
      return undefined
    }
  }

  const initialStepState = load()

  const onStepChange = (state: StepState) => {
    if (typeof window === "undefined") return
    const serializable = toSerializable(state)
    if (!serializable) return
    try {
      window.localStorage.setItem(key, JSON.stringify(serializable))
    } catch {
      // Ignore storage errors
    }
  }

  const clear = () => {
    if (typeof window === "undefined") return
    try {
      window.localStorage.removeItem(key)
    } catch {
      // Ignore storage errors
    }
  }

  return { initialStepState, onStepChange, clear }
}
