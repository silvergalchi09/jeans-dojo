import type {
  GlossaryItem,
  Question,
  SheetSection,
  Stage,
  StudyLine,
  Trap,
} from "./content"

export type CourseId = "jeans" | "penguins"

export type Course = {
  id: CourseId
  kicker: string
  title: string
  heroClass: string
  lede: string
  story: string
  trainModeText: string
  trapModeText: string
  glossaryHint: string
  trapClear: string
  trapMiss: string
  figure: "jeans" | "tree"
  stages: Stage[]
  questions: Question[]
  studyLines: StudyLine[]
  glossary: GlossaryItem[]
  traps: Trap[]
  sheetSections: SheetSection[]
  rankFor: (percent: number) => { name: string; line: string }
}

export function questionsFor(course: Course, stage: number) {
  return course.questions.filter((question) => question.stage === stage)
}

export function questionCount(course: Course) {
  return course.questions.length
}

export function sheetBlankCount(course: Course) {
  return course.sheetSections.reduce((sum, section) => sum + section.blanks.length, 0)
}
