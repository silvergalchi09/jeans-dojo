"use client"

import { Input } from "@/components/ui/input"
import { maskAnswer, type Blank } from "@/lib/grade"

type Status = "idle" | "good" | "bad"

type Props = {
  template: string
  blanks: Blank[]
  values: Record<string, string>
  messages: Record<string, string>
  status: Record<string, Status>
  onChange: (id: string, value: string) => void
  mode: "stacked" | "inline"
  startLine?: number
  hintLevel?: number
  locked?: boolean
}

function partsOf(line: string) {
  const parts: { kind: "text" | "blank"; value: string }[] = []
  const pattern = /\{\{([^}]+)\}\}/g
  let last = 0
  for (const match of line.matchAll(pattern)) {
    const index = match.index ?? 0
    if (index > last) parts.push({ kind: "text", value: line.slice(last, index) })
    parts.push({ kind: "blank", value: match[1] })
    last = index + match[0].length
  }
  if (last < line.length) parts.push({ kind: "text", value: line.slice(last) })
  if (parts.length === 0) parts.push({ kind: "text", value: "" })
  return parts
}

function orderOf(template: string) {
  return [...template.matchAll(/\{\{([^}]+)\}\}/g)].map((match) => match[1])
}

export function CodePrompt({
  template,
  blanks,
  values,
  messages,
  status,
  onChange,
  mode,
  startLine = 1,
  hintLevel = 0,
  locked = false,
}: Props) {
  const byId = new Map(blanks.map((item) => [item.id, item]))
  const order = orderOf(template)
  const lines = template.split("\n")

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-2xl bg-[#1c2430] px-3 py-4 text-[#f4efe4] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]">
        <div className="min-w-max font-mono text-[13.5px] leading-7 sm:text-[15px]">
          {lines.map((line, lineIndex) => (
            <div key={`${startLine + lineIndex}-${line}`} className="flex whitespace-pre">
              <span className="w-8 shrink-0 select-none pr-3 text-right text-[#8d97a3]">
                {startLine + lineIndex}
              </span>
              <span>
                {partsOf(line).map((part, partIndex) => {
                  if (part.kind === "text") return <span key={partIndex}>{part.value}</span>
                  const blank = byId.get(part.value)
                  const blankStatus = status[part.value] ?? "idle"
                  const number = order.indexOf(part.value) + 1
                  if (!blank) return <span key={partIndex}>{`{{${part.value}}}`}</span>
                  if (mode === "stacked") {
                    if (blankStatus === "good" || locked) {
                      return (
                        <span key={part.value} className="text-[#b7f0c8]">
                          {blank.answer}
                        </span>
                      )
                    }
                    return (
                      <span
                        key={part.value}
                        className={
                          blankStatus === "bad"
                            ? "rounded bg-[#6e2e2a] px-1.5 text-[#ffd0c8]"
                            : "rounded bg-[#6b4a16] px-1.5 text-[#ffe3a8]"
                        }
                      >
                        {number}
                      </span>
                    )
                  }
                  return (
                    <Input
                      key={part.value}
                      aria-label={blank.label}
                      spellCheck={false}
                      autoCapitalize="off"
                      autoCorrect="off"
                      disabled={locked || blankStatus === "good"}
                      value={values[part.value] ?? ""}
                      placeholder={blank.label}
                      onChange={(event) => onChange(part.value, event.target.value)}
                      style={{ width: `${Math.max(7, blank.answer.length + 2)}ch` }}
                      className={inlineClass(blankStatus)}
                    />
                  )
                })}
              </span>
            </div>
          ))}
        </div>
      </div>

      {mode === "stacked" && (
        <div className="space-y-3">
          {order.map((id, index) => {
            const blank = byId.get(id)
            if (!blank) return null
            const blankStatus = status[id] ?? "idle"
            return (
              <label key={id} className="block">
                <span className="mb-1 flex items-baseline justify-between gap-3 text-sm">
                  <span className="font-medium text-[#1d3e66]">
                    {index + 1}번 · {blank.label}
                  </span>
                  {hintLevel >= 1 && (
                    <span className="text-[#8a5a12]">{blank.hint}</span>
                  )}
                </span>
                {hintLevel >= 2 && (
                  <span className="mb-1 block font-mono text-sm text-[#8a5a12]">
                    모양 {maskAnswer(blank.answer)}
                  </span>
                )}
                <Input
                  aria-label={blank.label}
                  spellCheck={false}
                  autoCapitalize="off"
                  autoCorrect="off"
                  disabled={locked || blankStatus === "good"}
                  value={
                    locked && blankStatus !== "good"
                      ? (values[id] ?? "")
                      : (values[id] ?? "")
                  }
                  placeholder="코드를 입력"
                  onChange={(event) => onChange(id, event.target.value)}
                  className={stackedClass(blankStatus)}
                  autoFocus={index === 0 && !locked}
                />
                {blankStatus === "bad" && messages[id] && (
                  <span className="mt-1 block text-sm text-[#9c341f]">{messages[id]}</span>
                )}
              </label>
            )
          })}
        </div>
      )}

      {mode === "inline" && (
        <div className="space-y-1">
          {order.map((id) => {
            const blank = byId.get(id)
            const blankStatus = status[id] ?? "idle"
            if (!blank || blankStatus !== "bad" || !messages[id]) return null
            return (
              <p key={id} className="text-sm text-[#9c341f]">
                {blank.label}: {messages[id]}
                {hintLevel >= 1 ? ` · ${blank.hint}` : ""}
              </p>
            )
          })}
        </div>
      )}
    </div>
  )
}

function stackedClass(status: Status) {
  const base = "h-11 font-mono text-base md:text-sm"
  if (status === "good") return `${base} border-[#1f7a4d] bg-[#e7f6ec] text-[#145c38]`
  if (status === "bad") return `${base} border-[#a33b32] bg-[#fff1ee] text-[#7d261c]`
  return `${base} border-[#e0c48a] bg-[#fffaf0]`
}

function inlineClass(status: Status) {
  const base =
    "mx-0.5 inline-flex h-9 rounded-md border-0 border-b-2 px-1 align-middle font-mono text-base"
  if (status === "good") return `${base} border-[#7dcea0] bg-[#1d3b2c] text-[#d8ffe6]`
  if (status === "bad") return `${base} border-[#e08a7e] bg-[#4a2422] text-[#ffd5ce]`
  return `${base} border-[#e7b15a] bg-[#3a3122] text-[#ffe7b8] placeholder:text-[#cbb892]`
}
