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

const KEYS: Record<string, string> = {
  jeans: "jeans-dojo-save-v1",
  penguins: "penguins-dojo-save-v1",
}

let activeId = "jeans"
let memory: Save = EMPTY_SAVE
let loaded = false
const listeners = new Set<() => void>()

function storageKey(courseId: string) {
  return KEYS[courseId] ?? `dojo-save-v1:${courseId}`
}

function readKey(key: string): Save {
  if (typeof window === "undefined") return EMPTY_SAVE
  try {
    const raw = window.localStorage.getItem(key)
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

export function peekSave(courseId: string): Save {
  if (courseId === activeId && loaded) return memory
  return readKey(storageKey(courseId))
}

export function setSaveCourse(courseId: string) {
  if (activeId === courseId && loaded) return
  activeId = courseId
  memory = readKey(storageKey(courseId))
  loaded = true
  for (const listener of listeners) listener()
}

export function loadSave(): Save {
  return readKey(storageKey(activeId))
}

export function writeSave(save: Save) {
  if (typeof window === "undefined") return
  window.localStorage.setItem(storageKey(activeId), JSON.stringify(save))
}

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
