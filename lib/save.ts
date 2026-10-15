export type Save = {
  mastered: string[]
  bestExam: number | null
  bestCombo: number
  bestSheet: number | null
}

export const EMPTY_SAVE: Save = {
  mastered: [],
  bestExam: null,
  bestCombo: 0,
  bestSheet: null,
}

const KEY = "jeans-dojo-save-v1"

export function loadSave(): Save {
  if (typeof window === "undefined") return EMPTY_SAVE
  try {
    const raw = window.localStorage.getItem(KEY)
    if (!raw) return EMPTY_SAVE
    const parsed = JSON.parse(raw) as Partial<Save>
    return {
      mastered: Array.isArray(parsed.mastered)
        ? parsed.mastered.filter((item) => typeof item === "string")
        : [],
      bestExam: typeof parsed.bestExam === "number" ? parsed.bestExam : null,
      bestCombo: typeof parsed.bestCombo === "number" ? parsed.bestCombo : 0,
      bestSheet: typeof parsed.bestSheet === "number" ? parsed.bestSheet : null,
    }
  } catch {
    return EMPTY_SAVE
  }
}

export function writeSave(save: Save) {
  if (typeof window === "undefined") return
  window.localStorage.setItem(KEY, JSON.stringify(save))
}

let memory: Save = EMPTY_SAVE
let loaded = false
const listeners = new Set<() => void>()

export function subscribeSave(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function getSaveSnapshot(): Save {
  if (!loaded && typeof window !== "undefined") {
    memory = loadSave()
    loaded = true
  }
  return memory
}

export function getSaveServerSnapshot(): Save {
  return EMPTY_SAVE
}

export function commitSave(save: Save) {
  memory = save
  loaded = true
  writeSave(save)
  for (const listener of listeners) listener()
}
