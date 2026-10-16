"use client"

import { useState } from "react"
import type { FormEvent } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress, ProgressIndicator, ProgressTrack } from "@/components/ui/progress"
import type { Question } from "@/lib/content"
import { questionsFor } from "@/lib/course"
import { gradeBlank } from "@/lib/grade"
import { CodePrompt } from "@/components/dojo/code-prompt"
import { useDojo } from "@/components/dojo/context"

type Status = "idle" | "good" | "bad"
type Phase = "ask" | "solved" | "revealed"

export function StageMap() {
  const { save, hydrated, go, course } = useDojo()
  const stages = course.stages
  const weak = stages.flatMap((stage) =>
    questionsFor(course, stage.id).filter((question) => !save.mastered.includes(question.id)),
  )

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-4 py-6">
      <div>
        <p className="text-sm font-medium text-[#8a5a12]">단계 훈련</p>
        <h1 className="mt-1 text-2xl font-semibold text-[#1d3e66]">여섯 판을 순서대로</h1>
        <p className="mt-2 leading-7 text-[#3d4a5c]">
          각 칸 위에 한글 설명이 있다. 맞으면 왜 그 코드인지 한 줄로 남는다. 틀린 칸은 어디가 다른지 바로 말한다.
        </p>
      </div>
      <ol className="grid gap-3">
        {stages.map((stage) => {
          const items = questionsFor(course, stage.id)
          const done = items.filter((question) => save.mastered.includes(question.id)).length
          return (
            <li key={stage.id}>
              <button
                type="button"
                onClick={() => go({ name: "train", stage: stage.id })}
                className="flex w-full items-center gap-4 rounded-2xl bg-[#fffaf1] px-4 py-4 text-left ring-1 ring-[#eadcbf] transition hover:ring-[#1d3e66]"
              >
                <span className="grid size-11 shrink-0 place-items-center rounded-full bg-[#1d3e66] font-mono text-sm text-[#f6efe4]">
                  {stage.id}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-medium text-[#1d3e66]">{stage.title}</span>
                  <span className="mt-0.5 block text-sm leading-6 text-[#5c5346]">{stage.blurb}</span>
                </span>
                <span className="font-mono text-sm text-[#8a5a12]">
                  {hydrated ? `${done}/${items.length}` : "·"}
                </span>
              </button>
            </li>
          )
        })}
      </ol>
      {hydrated && weak.length > 0 && weak.length < stages.reduce((sum, stage) => sum + questionsFor(course, stage.id).length, 0) && (
        <Button
          type="button"
          variant="outline"
          className="h-11"
          onClick={() =>
            go({
              name: "train",
              stage: weak[0].stage,
              questionId: weak[0].id,
            })
          }
        >
          처음 막힌 판으로 · 남은 {weak.length}칸
        </Button>
      )}
    </div>
  )
}

export function TrainView({ stage, questionId }: { stage: number; questionId?: string }) {
  const { go, master, noteCombo, course } = useDojo()
  const stages = course.stages
  const items = questionsFor(course, stage)
  const info = stages.find((item) => item.id === stage)
  const start = Math.max(
    0,
    questionId ? items.findIndex((question) => question.id === questionId) : 0,
  )
  const [index, setIndex] = useState(start === -1 ? 0 : start)
  const [values, setValues] = useState<Record<string, string>>({})
  const [status, setStatus] = useState<Record<string, Status>>({})
  const [messages, setMessages] = useState<Record<string, string>>({})
  const [hintLevel, setHintLevel] = useState(0)
  const [attempts, setAttempts] = useState(0)
  const [phase, setPhase] = useState<Phase>("ask")
  const [combo, setCombo] = useState(0)
  const [score, setScore] = useState(0)
  const [shake, setShake] = useState(false)
  const [slipped, setSlipped] = useState<string[]>([])

  const question = items[index]
  const finished = index >= items.length
  const activeId = question?.id ?? "done"
  const [seenId, setSeenId] = useState(activeId)
  if (seenId !== activeId) {
    setSeenId(activeId)
    setValues({})
    setStatus({})
    setMessages({})
    setHintLevel(0)
    setAttempts(0)
    setPhase("ask")
    setShake(false)
  }

  function grade(current: Question) {
    const nextStatus: Record<string, Status> = {}
    const nextMessages: Record<string, string> = {}
    let ok = true
    for (const item of current.blanks) {
      const result = gradeBlank(values[item.id] ?? "", item)
      nextStatus[item.id] = result.ok ? "good" : "bad"
      if (!result.ok) {
        ok = false
        nextMessages[item.id] = result.message ?? "다시 보자."
      }
    }
    setStatus(nextStatus)
    setMessages(nextMessages)
    return ok
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault()
    if (!question || phase !== "ask") return
    const ok = grade(question)
    if (ok) {
      const clean = attempts === 0 && hintLevel < 2
      const nextCombo = clean ? combo + 1 : 0
      setCombo(nextCombo)
      noteCombo(nextCombo)
      if (hintLevel < 2) master(question.id)
      setScore((prev) => prev + (clean ? 120 : 70) + nextCombo * 10)
      setPhase("solved")
      return
    }
    setCombo(0)
    setAttempts((prev) => prev + 1)
    setSlipped((prev) => (prev.includes(question.id) ? prev : [...prev, question.id]))
    setShake(true)
    window.setTimeout(() => setShake(false), 420)
  }

  function reveal() {
    if (!question) return
    const filled: Record<string, string> = {}
    const nextStatus: Record<string, Status> = {}
    for (const item of question.blanks) {
      filled[item.id] = item.answer
      nextStatus[item.id] = "good"
    }
    setValues(filled)
    setStatus(nextStatus)
    setMessages({})
    setCombo(0)
    setPhase("revealed")
  }

  if (!info) return null

  if (finished) {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-4 py-8">
        <p className="text-sm font-medium text-[#8a5a12]">{info.title}</p>
        <h1 className="text-3xl font-semibold text-[#1d3e66]">이 판은 끝</h1>
        <p className="leading-7 text-[#3d4a5c]">
          점수 {score}. 최고 콤보를 홈에서 기억해 둔다.
          {slipped.length > 0
            ? ` 한 번이라도 틀린 문제 ${slipped.length}개는 내일 아침에 그 단계만 다시 열면 된다.`
            : " 이번 판은 막힘없이 통과했다."}
        </p>
        <div className="flex flex-wrap gap-2">
          {stage < stages.length && (
            <Button type="button" className="h-11" onClick={() => go({ name: "train", stage: stage + 1 })}>
              다음 판
            </Button>
          )}
          {stage === stages.length && (
            <Button type="button" className="h-11" onClick={() => go({ name: "sheet" })}>
              실전 빈칸지
            </Button>
          )}
          <Button type="button" variant="outline" className="h-11" onClick={() => go({ name: "map" })}>
            판 목록
          </Button>
        </div>
      </div>
    )
  }

  const percent = Math.round((index / items.length) * 100)

  return (
    <form onSubmit={onSubmit} className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-4 py-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-[#8a5a12]">
            {stage}판 · {info.title}
          </p>
          <h1 className="text-xl font-semibold text-[#1d3e66]">
            {index + 1} / {items.length}
          </h1>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="h-7 px-2">
            콤보 {combo}
          </Badge>
          <Badge variant="secondary" className="h-7 px-2">
            {score}점
          </Badge>
        </div>
      </div>
      <Progress value={percent}>
        <ProgressTrack className="h-1.5 bg-[#ead9b8]">
          <ProgressIndicator className="bg-[#1d3e66]" />
        </ProgressTrack>
      </Progress>

      <p className="rounded-2xl bg-[#fff4d8] px-4 py-3 leading-7 text-[#3d3422]">{question.prompt}</p>

      <div className={shake ? "dojo-shake" : undefined}>
        <CodePrompt
          key={question.id}
          template={question.template}
          blanks={question.blanks}
          values={values}
          messages={messages}
          status={status}
          mode="stacked"
          startLine={question.startLine}
          hintLevel={hintLevel}
          locked={phase !== "ask"}
          onChange={(id, value) => setValues((prev) => ({ ...prev, [id]: value }))}
        />
      </div>

      {phase === "ask" ? (
        <div className="flex flex-wrap gap-2">
          <Button type="submit" className="h-11 px-5">
            채점
          </Button>
          <Button
            type="button"
            variant="outline"
            className="h-11"
            onClick={() => setHintLevel((level) => Math.min(2, level + 1))}
            disabled={hintLevel >= 2}
          >
            {hintLevel === 0 ? "힌트" : hintLevel === 1 ? "모양 힌트" : "힌트를 다 씀"}
          </Button>
          <Button type="button" variant="ghost" className="h-11" onClick={reveal}>
            정답 보고 넘어가기
          </Button>
        </div>
      ) : (
        <div className="rounded-2xl bg-[#eef7f1] px-4 py-4 ring-1 ring-[#b7dfc6]">
          <p className="text-sm font-medium text-[#1f7a4d]">
            {phase === "solved" ? "맞았다" : "정답을 열어 두었다"}
          </p>
          <p className="mt-1 leading-7 text-[#1c3b2c]">{question.why}</p>
          <Button
            type="button"
            className="mt-3 h-11"
            onClick={() => setIndex((value) => value + 1)}
          >
            {index + 1 === items.length ? "판 마무리" : "다음 빈칸"}
          </Button>
        </div>
      )}
      <p className="text-sm text-[#8a8072]">Enter로 채점. 띄어쓰기와 따옴표 종류는 봐 준다. 대소문자와 밑줄은 안 봐 준다.</p>
    </form>
  )
}
