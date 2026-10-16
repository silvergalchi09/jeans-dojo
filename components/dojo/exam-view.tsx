"use client"

import { useEffect, useRef, useState } from "react"
import type { FormEvent } from "react"
import { Button } from "@/components/ui/button"
import type { Question } from "@/lib/content"
import { gradeBlank } from "@/lib/grade"
import { CodePrompt } from "@/components/dojo/code-prompt"
import { useDojo } from "@/components/dojo/context"

type Status = "idle" | "good" | "bad"
type Phase = "pick" | "ask" | "told" | "result"

type Review = {
  question: Question
  ok: boolean
  given: Record<string, string>
}

function shuffle<T>(items: T[]) {
  const next = [...items]
  for (let index = next.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1))
    ;[next[index], next[swap]] = [next[swap], next[index]]
  }
  return next
}

export function ExamView() {
  const { go, master, noteExam, course } = useDojo()
  const questions = course.questions
  const [phase, setPhase] = useState<Phase>("pick")
  const [round, setRound] = useState<Question[]>([])
  const [index, setIndex] = useState(0)
  const [seconds, setSeconds] = useState<number | null>(null)
  const [left, setLeft] = useState(0)
  const [values, setValues] = useState<Record<string, string>>({})
  const [status, setStatus] = useState<Record<string, Status>>({})
  const [messages, setMessages] = useState<Record<string, string>>({})
  const [reviews, setReviews] = useState<Review[]>([])
  const busy = useRef(false)
  const live = useRef({ values, question: round[index], phase })
  const leftRef = useRef(left)
  const question = round[index]
  live.current = { values, question, phase }
  leftRef.current = left

  useEffect(() => {
    if (phase !== "ask" || seconds === null) return
    const timer = window.setInterval(() => {
      const next = Math.max(0, leftRef.current - 1)
      leftRef.current = next
      setLeft(next)
      if (next === 0) lockIn()
    }, 1000)
    return () => window.clearInterval(timer)
    // lockIn reads the latest answers from a ref.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, seconds, index])

  function begin(count: number, limit: number | null) {
    busy.current = false
    setRound(shuffle(questions).slice(0, count))
    setIndex(0)
    setReviews([])
    setValues({})
    setStatus({})
    setMessages({})
    setSeconds(limit)
    setLeft(limit ?? 0)
    setPhase("ask")
  }

  function lockIn() {
    const current = live.current
    if (!current.question || current.phase !== "ask" || busy.current) return
    busy.current = true
    const nextStatus: Record<string, Status> = {}
    const nextMessages: Record<string, string> = {}
    let ok = true
    for (const item of current.question.blanks) {
      const result = gradeBlank(current.values[item.id] ?? "", item)
      nextStatus[item.id] = result.ok ? "good" : "bad"
      if (!result.ok) {
        ok = false
        nextMessages[item.id] = result.message ?? "다르다."
      }
    }
    setStatus(nextStatus)
    setMessages(nextMessages)
    if (ok) master(current.question.id)
    setReviews((prev) => [
      ...prev,
      { question: current.question, ok, given: { ...current.values } },
    ])
    setPhase("told")
  }

  function finish(all: Review[]) {
    const correct = all.filter((item) => item.ok).length
    const percent = all.length ? Math.round((correct / all.length) * 100) : 0
    noteExam(percent)
    setPhase("result")
  }

  function next() {
    busy.current = false
    const upcoming = index + 1
    if (upcoming >= round.length) {
      finish(reviews)
      return
    }
    setIndex(upcoming)
    setValues({})
    setStatus({})
    setMessages({})
    setPhase("ask")
  }

  if (phase === "pick") {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-4 py-6">
        <p className="text-sm font-medium text-[#8a5a12]">모의고사</p>
        <h1 className="text-2xl font-semibold text-[#1d3e66]">힌트 없이 한 번씩</h1>
        <p className="leading-7 text-[#3d4a5c]">
          문제가 섞여 나온다. 칸은 한 번만 채점하고, 바로 정답과 이유를 보여 준다. 끝난 뒤에 틀린 것만 다시 훈련으로 보낼 수 있다.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <Button type="button" className="h-16" onClick={() => begin(8, 6 * 60)}>
            8문제 · 6분
          </Button>
          <Button type="button" className="h-16" variant="outline" onClick={() => begin(15, 10 * 60)}>
            15문제 · 10분
          </Button>
        </div>
        <Button type="button" variant="ghost" className="h-11 justify-start px-0" onClick={() => begin(8, null)}>
          8문제, 시간 없이
        </Button>
      </div>
    )
  }

  if (phase === "result") {
    const correct = reviews.filter((item) => item.ok).length
    const percent = reviews.length ? Math.round((correct / reviews.length) * 100) : 0
    const rank = course.rankFor(percent)
    const missed = reviews.filter((item) => !item.ok)
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-4 py-6">
        <p className="font-mono text-sm text-[#8a5a12]">
          {correct} / {reviews.length}문제 · {percent}%
        </p>
        <h1 className="text-3xl font-semibold text-[#1d3e66]">{rank.name}</h1>
        <p className="leading-7 text-[#3d4a5c]">{rank.line}</p>
        {missed.length > 0 && (
          <ul className="space-y-3">
            {missed.map((item) => (
              <li key={item.question.id} className="rounded-2xl bg-[#fffaf1] p-4 ring-1 ring-[#eadcbf]">
                <p className="font-medium text-[#1d3e66]">{item.question.prompt}</p>
                <ul className="mt-2 space-y-1 font-mono text-sm">
                  {item.question.blanks.map((blank) => (
                    <li key={blank.id}>
                      <span className="text-[#9c341f]">{item.given[blank.id] || "(빈칸)"}</span>
                      <span className="text-[#8a8072]"> → </span>
                      <span className="text-[#1f7a4d]">{blank.answer}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-2 text-sm leading-6 text-[#3d4a5c]">{item.question.why}</p>
                <Button
                  type="button"
                  variant="outline"
                  className="mt-3 h-9"
                  onClick={() =>
                    go({
                      name: "train",
                      stage: item.question.stage,
                      questionId: item.question.id,
                    })
                  }
                >
                  이 칸만 다시
                </Button>
              </li>
            ))}
          </ul>
        )}
        <div className="flex flex-wrap gap-2">
          <Button type="button" className="h-11" onClick={() => setPhase("pick")}>
            한 번 더
          </Button>
          <Button type="button" variant="outline" className="h-11" onClick={() => go({ name: "home" })}>
            홈
          </Button>
        </div>
      </div>
    )
  }

  if (!question) return null

  const clock =
    seconds === null ? "시간 없음" : `${String(Math.floor(left / 60)).padStart(2, "0")}:${String(left % 60).padStart(2, "0")}`

  return (
    <form
      onSubmit={(event: FormEvent) => {
        event.preventDefault()
        if (phase === "ask") lockIn()
      }}
      className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-4 py-6"
    >
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-[#8a5a12]">모의고사</p>
          <h1 className="text-xl font-semibold text-[#1d3e66]">
            {index + 1} / {round.length}
          </h1>
        </div>
        <p className="font-mono text-lg text-[#1d3e66]">{clock}</p>
      </div>
      <p className="rounded-2xl bg-[#fff4d8] px-4 py-3 leading-7 text-[#3d3422]">{question.prompt}</p>
      <CodePrompt
        key={question.id}
        template={question.template}
        blanks={question.blanks}
        values={values}
        messages={messages}
        status={status}
        mode="stacked"
        startLine={question.startLine}
        locked={phase === "told"}
        onChange={(id, value) => setValues((prev) => ({ ...prev, [id]: value }))}
      />
      {phase === "ask" ? (
        <Button type="submit" className="h-11 w-fit px-5">
          채점하고 넘어갈 준비
        </Button>
      ) : (
        <div className="rounded-2xl bg-[#fffaf1] px-4 py-4 ring-1 ring-[#eadcbf]">
          <p className="font-medium text-[#1d3e66]">{reviews.at(-1)?.ok ? "맞았다" : "여기까지가 제출이다"}</p>
          <p className="mt-1 leading-7 text-[#3d4a5c]">{question.why}</p>
          <Button type="button" className="mt-3 h-11" onClick={next}>
            {index + 1 === round.length ? "결과 보기" : "다음 문제"}
          </Button>
        </div>
      )}
    </form>
  )
}
