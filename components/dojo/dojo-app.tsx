"use client"

import { useEffect, useState, useSyncExternalStore } from "react"
import { BookOpen, ListChecks, ScrollText, Timer, TriangleAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { questionCount, questionsFor, stages, story } from "@/lib/content"
import {
  commitSave,
  EMPTY_SAVE,
  getSaveServerSnapshot,
  getSaveSnapshot,
  subscribeSave,
  type Save,
} from "@/lib/save"
import { DojoContext, type Screen, useDojo } from "@/components/dojo/context"
import { ExamView } from "@/components/dojo/exam-view"
import { SheetView } from "@/components/dojo/sheet-view"
import { StudyView } from "@/components/dojo/study-view"
import { TrapView } from "@/components/dojo/trap-view"
import { StageMap, TrainView } from "@/components/dojo/train-view"

const titles: Record<Screen["name"], string> = {
  home: "홈",
  study: "해설",
  map: "단계",
  train: "훈련",
  sheet: "빈칸지",
  exam: "모의고사",
  traps: "함정",
}

export function DojoApp() {
  const save = useSyncExternalStore(subscribeSave, getSaveSnapshot, getSaveServerSnapshot)
  const setSave = (updater: Save | ((prev: Save) => Save)) => {
    const next = typeof updater === "function" ? updater(getSaveSnapshot()) : updater
    commitSave(next)
  }
  const [screen, setScreen] = useState<Screen>({ name: "home" })
  const [resetOpen, setResetOpen] = useState(false)
  const hydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  )

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [screen])

  const value = {
    save,
    hydrated,
    screen,
    go: setScreen,
    master: (id: string) =>
      setSave((prev) =>
        prev.mastered.includes(id) ? prev : { ...prev, mastered: [...prev.mastered, id] },
      ),
    noteCombo: (combo: number) =>
      setSave((prev) => (combo > prev.bestCombo ? { ...prev, bestCombo: combo } : prev)),
    noteExam: (percent: number) =>
      setSave((prev) =>
        prev.bestExam === null || percent > prev.bestExam ? { ...prev, bestExam: percent } : prev,
      ),
    noteSheet: (percent: number) =>
      setSave((prev) =>
        prev.bestSheet === null || percent > prev.bestSheet
          ? { ...prev, bestSheet: percent }
          : prev,
      ),
    reset: () => setSave(EMPTY_SAVE),
  }

  return (
    <DojoContext.Provider value={value}>
      <div className="dojo min-h-full flex-1">
        <header className="sticky top-0 z-20 border-b border-[#dccbae] bg-[#efe6d6]/90 backdrop-blur">
          <div className="mx-auto flex h-14 w-full max-w-3xl items-center justify-between px-4">
            <button type="button" className="text-left" onClick={() => setScreen({ name: "home" })}>
              <span className="block text-[11px] tracking-[0.16em] text-[#8a5a12]">JEANS LAB</span>
              <span className="block font-semibold text-[#1d3e66]">진스 도장</span>
            </button>
            <span className="text-sm text-[#5c5346]">{titles[screen.name]}</span>
          </div>
        </header>
        {screen.name === "home" && <Home onReset={() => setResetOpen(true)} />}
        {screen.name === "study" && <StudyView />}
        {screen.name === "map" && <StageMap />}
        {screen.name === "train" && (
          <TrainView key={`${screen.stage}-${screen.questionId ?? "start"}`} stage={screen.stage} questionId={screen.questionId} />
        )}
        {screen.name === "sheet" && <SheetView />}
        {screen.name === "exam" && <ExamView />}
        {screen.name === "traps" && <TrapView />}
      </div>
      <Dialog open={resetOpen} onOpenChange={setResetOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>진도를 지울까?</DialogTitle>
            <DialogDescription>
              외운 칸, 모의고사 최고 점수, 빈칸지 점수가 이 브라우저에서 사라진다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setResetOpen(false)}>
              남겨 두기
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => {
                setSave(EMPTY_SAVE)
                setResetOpen(false)
              }}
            >
              지우기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DojoContext.Provider>
  )
}

function Home({ onReset }: { onReset: () => void }) {
  const { go, save, hydrated } = useDojo()
  const total = questionCount()
  const done = save.mastered.length
  const nextStage =
    stages.find((stage) =>
      questionsFor(stage.id).some((question) => !save.mastered.includes(question.id)),
    ) ?? stages[0]

  const modes: {
    name: string
    text: string
    action: Screen
    icon: typeof BookOpen
  }[] = [
    {
      name: "줄마다 해설",
      text: "코드 옆에 한글이 붙어 있다. 가리고 외운 뒤 사전에서 이름을 찾는다.",
      action: { name: "study" },
      icon: BookOpen,
    },
    {
      name: "단계 훈련",
      text: "설명만 보고 칸을 채운다. 틀리면 목과 허리를 바꿨는지, 밑줄이 빠졌는지 말해 준다.",
      action: { name: "map" },
      icon: ListChecks,
    },
    {
      name: "실전 빈칸지",
      text: "수행평가 종이처럼 코드 한 장에 칸이 뚫려 있다.",
      action: { name: "sheet" },
      icon: ScrollText,
    },
    {
      name: "모의고사",
      text: "섞인 문제를 힌트 없이 한 번씩. 끝나면 틀린 칸만 다시 갈 수 있다.",
      action: { name: "exam" },
      icon: Timer,
    },
    {
      name: "함정 10개",
      text: "순서, 30%, 파란 점, 밑줄. 철자보다 이쪽을 더 많이 틀린다.",
      action: { name: "traps" },
      icon: TriangleAlert,
    },
  ]

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-5 px-4 py-6 sm:py-10">
      <section className="denim relative overflow-hidden rounded-[28px] px-6 py-8 sm:px-8">
        <p className="text-xs tracking-[0.18em] text-[#f0d7a2]">수행평가 직전</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">진스 도장</h1>
        <p className="mt-3 max-w-xl text-lg leading-8 text-[#f6efe4]/90">
          목둘레로 허리둘레를 맞히는 선형회귀. 선생님이 지운 칸을, 한글 설명만 보고 다시 쓴다.
        </p>
        <Button
          type="button"
          className="mt-6 h-11 bg-[#f0d7a2] text-[#1d3e66] hover:bg-[#f6e3b8]"
          onClick={() => go(done === 0 ? { name: "study" } : { name: "train", stage: nextStage.id })}
        >
          {done === 0 ? "해설부터 시작" : `${nextStage.title} 이어서`}
        </Button>
      </section>

      <section className="rounded-2xl bg-[#fff4d8] px-4 py-4 ring-1 ring-[#ead39a]">
        <p className="text-sm font-medium text-[#8a5a12]">한 줄로 외우기</p>
        <p className="mt-1 leading-7 text-[#3d3422]">{story}</p>
      </section>

      <div className="grid gap-3">
        {modes.map((mode, index) => {
          const Icon = mode.icon
          return (
            <button
              key={mode.name}
              type="button"
              onClick={() => go(mode.action)}
              className="flex items-start gap-4 rounded-2xl bg-[#fffaf1] px-4 py-4 text-left ring-1 ring-[#eadcbf] transition hover:ring-[#1d3e66]"
            >
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#1d3e66] text-[#f6efe4]">
                <Icon className="size-5" />
              </span>
              <span>
                <span className="block font-medium text-[#1d3e66]">
                  0{index + 1} {mode.name}
                </span>
                <span className="mt-1 block text-sm leading-6 text-[#5c5346]">{mode.text}</span>
              </span>
            </button>
          )
        })}
      </div>

      <section className="grid grid-cols-3 gap-2 text-center">
        <Stat label="외운 칸" value={hydrated ? `${done}/${total}` : "·"} />
        <Stat label="모의고사" value={hydrated && save.bestExam !== null ? `${save.bestExam}%` : "·"} />
        <Stat label="최고 콤보" value={hydrated && save.bestCombo > 0 ? String(save.bestCombo) : "·"} />
      </section>
      <div className="flex items-center justify-between gap-3 text-sm text-[#8a8072]">
        <p>진도는 이 브라우저에만 저장된다.</p>
        <Button type="button" variant="ghost" className="h-8" onClick={onReset}>
          진도 지우기
        </Button>
      </div>
    </main>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-[#fffaf1] px-2 py-3 ring-1 ring-[#eadcbf]">
      <p className="text-xs text-[#8a8072]">{label}</p>
      <p className="mt-1 font-mono text-lg text-[#1d3e66]">{value}</p>
    </div>
  )
}
