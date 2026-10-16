"use client"

import { createContext, useContext } from "react"
import type { Course } from "@/lib/course"
import type { Save } from "@/lib/save"

export type Screen =
  | { name: "lobby" }
  | { name: "home" }
  | { name: "study" }
  | { name: "map" }
  | { name: "train"; stage: number; questionId?: string }
  | { name: "sheet" }
  | { name: "exam" }
  | { name: "traps" }

type DojoContextValue = {
  course: Course
  save: Save
  hydrated: boolean
  screen: Screen
  go: (screen: Screen) => void
  master: (id: string) => void
  noteCombo: (combo: number) => void
  noteExam: (percent: number) => void
  noteSheet: (percent: number) => void
  reset: () => void
}

export const DojoContext = createContext<DojoContextValue | null>(null)

export function useDojo() {
  const value = useContext(DojoContext)
  if (!value) throw new Error("도장 화면 밖에서 상태를 썼다")
  return value
}
