import "@testing-library/jest-dom"
import { createLocalStorageStepPersistence } from "../persistence"
import { StepType } from "../steps/UploadFlow"
import type { StepState } from "../steps/UploadFlow"

const STORAGE_KEY = "rsi-test-persistence"

describe("createLocalStorageStepPersistence", () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it("returns undefined initialStepState when nothing is stored", () => {
    const persistence = createLocalStorageStepPersistence(STORAGE_KEY)
    expect(persistence.initialStepState).toBeUndefined()
  })

  it("persists and restores upload step", () => {
    const persistence1 = createLocalStorageStepPersistence(STORAGE_KEY)
    persistence1.onStepChange({ type: StepType.upload })

    const persistence2 = createLocalStorageStepPersistence(STORAGE_KEY)
    expect(persistence2.initialStepState).toEqual({ type: StepType.upload })
  })

  it("persists and restores matchColumns step", () => {
    const state: StepState = {
      type: StepType.matchColumns,
      data: [["Josh"]],
      headerValues: ["name"],
    }
    const persistence1 = createLocalStorageStepPersistence(STORAGE_KEY)
    persistence1.onStepChange(state)

    const persistence2 = createLocalStorageStepPersistence(STORAGE_KEY)
    expect(persistence2.initialStepState).toEqual(state)
  })

  it("does not persist selectSheet step", () => {
    const persistence1 = createLocalStorageStepPersistence(STORAGE_KEY)
    persistence1.onStepChange({
      type: StepType.selectSheet,
      workbook: {} as any,
    })

    expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull()
  })

  it("clear removes stored state", () => {
    const persistence1 = createLocalStorageStepPersistence(STORAGE_KEY)
    persistence1.onStepChange({ type: StepType.upload })

    const persistence2 = createLocalStorageStepPersistence(STORAGE_KEY)
    expect(persistence2.initialStepState).toEqual({ type: StepType.upload })

    persistence2.clear()

    const persistence3 = createLocalStorageStepPersistence(STORAGE_KEY)
    expect(persistence3.initialStepState).toBeUndefined()
  })
})
