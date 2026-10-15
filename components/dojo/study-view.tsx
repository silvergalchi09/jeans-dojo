"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { glossary, story, studyLines } from "@/lib/content"
import { JeansChart } from "@/components/dojo/chart"
import { useDojo } from "@/components/dojo/context"

export function StudyView() {
  const { go } = useDojo()
  const [covered, setCovered] = useState(false)
  const [open, setOpen] = useState<Record<number, boolean>>({})
  const [query, setQuery] = useState("")

  const terms = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return glossary
    return glossary.filter((item) =>
      `${item.term} ${item.say} ${item.write}`.toLowerCase().includes(needle),
    )
  }, [query])

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-5 px-4 py-6">
      <div>
        <p className="text-sm font-medium text-[#8a5a12]">먼저 읽고, 그다음 빈칸</p>
        <h1 className="mt-1 text-2xl font-semibold text-[#1d3e66]">줄마다 해설</h1>
        <p className="mt-2 leading-7 text-[#3d4a5c]">{story}</p>
      </div>

      <JeansChart />

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          className="h-10"
          onClick={() => {
            setCovered((value) => !value)
            setOpen({})
          }}
        >
          {covered ? "코드 전부 보기" : "코드 가리고 외우기"}
        </Button>
        <Button type="button" className="h-10" onClick={() => go({ name: "map" })}>
          빈칸 훈련으로
        </Button>
      </div>

      <ol className="overflow-hidden rounded-2xl bg-[#fffaf1] ring-1 ring-[#eadcbf]">
        {studyLines.map((line, index) => {
          if (!line.code) return <li key={index} className="h-3 bg-[#f3ead8]" />
          const revealed = !covered || open[index]
          return (
            <li key={line.code} className="border-b border-[#f0e4cc] last:border-b-0">
              <button
                type="button"
                className="grid w-full gap-1 px-4 py-3 text-left sm:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] sm:gap-4"
                onClick={() => setOpen((prev) => ({ ...prev, [index]: !prev[index] }))}
              >
                <span className="font-mono text-[13px] leading-6 text-[#1c2430] sm:text-sm">
                  {revealed ? line.code : "···· 탭해서 코드 보기"}
                </span>
                <span className="text-sm leading-6 text-[#5c5346]">
                  {line.say}
                  {line.trap && (
                    <span className="mt-1 block text-[#9c341f]">함정 · {line.trap}</span>
                  )}
                </span>
              </button>
            </li>
          )
        })}
      </ol>

      <section className="rounded-2xl bg-[#fffaf1] p-4 ring-1 ring-[#eadcbf]">
        <h2 className="text-lg font-semibold text-[#1d3e66]">빈칸 사전</h2>
        <p className="mt-1 text-sm leading-6 text-[#5c5346]">
          선생님이 다른 곳을 뚫어도, 여기 있는 이름이면 같은 코드다.
        </p>
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="이름 검색. 예: coef, 목, split"
          className="mt-3 h-11 bg-white"
          aria-label="빈칸 사전 검색"
        />
        <ul className="mt-3 divide-y divide-[#f0e4cc]">
          {terms.map((item) => (
            <li key={item.term} className="py-3">
              <p className="font-medium text-[#1d3e66]">{item.term}</p>
              <p className="mt-0.5 text-sm leading-6 text-[#3d4a5c]">{item.say}</p>
              <p className="mt-1 font-mono text-sm text-[#1c2430]">{item.write}</p>
            </li>
          ))}
          {terms.length === 0 && (
            <li className="py-6 text-sm text-[#5c5346]">그 단어는 사전에 없다. 철자를 조금 바꿔 봐.</li>
          )}
        </ul>
      </section>
    </div>
  )
}
