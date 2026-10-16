"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { sheetBlankCount } from "@/lib/course"
import { gradeBlank, type Blank } from "@/lib/grade"
import { CodePrompt } from "@/components/dojo/code-prompt"
import { useDojo } from "@/components/dojo/context"

type Status = "idle" | "good" | "bad"

export function SheetView() {
  const { noteSheet, course } = useDojo()
  const sheetSections = course.sheetSections
  const [values, setValues] = useState<Record<string, string>>({})
  const [status, setStatus] = useState<Record<string, Status>>({})
  const [messages, setMessages] = useState<Record<string, string>>({})
  const [hintLevel, setHintLevel] = useState(0)
  const [graded, setGraded] = useState(false)
  const total = sheetBlankCount(course)

  const correct = useMemo(
    () => Object.values(status).filter((item) => item === "good").length,
    [status],
  )

  function gradeBlanks(blanks: Blank[]) {
    setStatus((prev) => {
      const next = { ...prev }
      for (const item of blanks) {
        if (next[item.id] === "good") continue
        next[item.id] = gradeBlank(values[item.id] ?? "", item).ok ? "good" : "bad"
      }
      return next
    })
    setMessages((prev) => {
      const next = { ...prev }
      for (const item of blanks) {
        if (status[item.id] === "good") continue
        const result = gradeBlank(values[item.id] ?? "", item)
        if (result.ok) delete next[item.id]
        else next[item.id] = result.message ?? "다시 보자."
      }
      return next
    })
  }

  function gradeAll() {
    const blanks = sheetSections.flatMap((section) => section.blanks)
    const nextStatus: Record<string, Status> = {}
    const nextMessages: Record<string, string> = {}
    let good = 0
    for (const item of blanks) {
      const result = gradeBlank(values[item.id] ?? "", item)
      nextStatus[item.id] = result.ok ? "good" : "bad"
      if (result.ok) good += 1
      else nextMessages[item.id] = result.message ?? "다시 보자."
    }
    setStatus(nextStatus)
    setMessages(nextMessages)
    setGraded(true)
    noteSheet(Math.round((good / total) * 100))
  }

  const percent = Math.round((correct / total) * 100)
  const rank = course.rankFor(percent)

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-5 px-4 py-6">
      <div>
        <p className="text-sm font-medium text-[#8a5a12]">실전 빈칸지</p>
        <h1 className="mt-1 text-2xl font-semibold text-[#1d3e66]">선생님이 칸을 뚫어 둔 코드</h1>
        <p className="mt-2 leading-7 text-[#3d4a5c]">
          수행평가 종이랑 같은 순서다. 아는 칸부터 채워도 된다. 묶음마다 채점하거나, 마지막에 한 번에 채점한다.
          맞은 칸은 잠긴다.
        </p>
      </div>

      <nav className="flex flex-wrap gap-2">
        {sheetSections.map((section) => (
          <a
            key={section.id}
            href={`#${section.id}`}
            className="rounded-full bg-[#fffaf1] px-3 py-1 text-sm text-[#1d3e66] ring-1 ring-[#eadcbf]"
          >
            {section.title}
          </a>
        ))}
      </nav>

      {sheetSections.map((section) => (
        <section key={section.id} id={section.id} className="scroll-mt-20">
          <div className="mb-2 flex items-center justify-between gap-3">
            <h2 className="font-medium text-[#1d3e66]">{section.title}</h2>
            <Button
              type="button"
              variant="outline"
              className="h-9"
              onClick={() => gradeBlanks(section.blanks)}
            >
              이 묶음 채점
            </Button>
          </div>
          <CodePrompt
            template={section.template}
            blanks={section.blanks}
            values={values}
            messages={messages}
            status={status}
            mode="inline"
            startLine={section.startLine}
            hintLevel={hintLevel}
            onChange={(id, value) => {
              setValues((prev) => ({ ...prev, [id]: value }))
              setStatus((prev) => {
                if (prev[id] !== "bad") return prev
                return { ...prev, [id]: "idle" }
              })
            }}
          />
        </section>
      ))}

      <div className="flex flex-wrap gap-2">
        <Button type="button" className="h-11 px-5" onClick={gradeAll}>
          전체 채점
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-11"
          onClick={() => setHintLevel(1)}
        >
          틀린 칸 힌트
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="h-11"
          onClick={() => {
            setValues({})
            setStatus({})
            setMessages({})
            setHintLevel(0)
            setGraded(false)
          }}
        >
          빈칸지 비우기
        </Button>
      </div>

      {graded && (
        <div className="rounded-2xl bg-[#fffaf1] px-4 py-4 ring-1 ring-[#eadcbf]">
          <p className="font-mono text-sm text-[#8a5a12]">
            {correct} / {total}칸 · {percent}%
          </p>
          <h2 className="mt-1 text-2xl font-semibold text-[#1d3e66]">{rank.name}</h2>
          <p className="mt-1 leading-7 text-[#3d4a5c]">{rank.line}</p>
        </div>
      )}
    </div>
  )
}
