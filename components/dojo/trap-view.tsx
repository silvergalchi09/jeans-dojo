"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { traps, type Trap } from "@/lib/content"
import { useDojo } from "@/components/dojo/context"

type Card = Trap & { shuffled: string[] }

function shuffle<T>(items: T[]) {
  const next = [...items]
  for (let index = next.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1))
    ;[next[index], next[swap]] = [next[swap], next[index]]
  }
  return next
}

export function TrapView() {
  const { go } = useDojo()
  const [round] = useState<Card[]>(() =>
    shuffle(traps).map((trap) => ({ ...trap, shuffled: shuffle(trap.choices) })),
  )
  const [index, setIndex] = useState(0)
  const [picked, setPicked] = useState<string | null>(null)
  const [correct, setCorrect] = useState(0)
  const card = round[index]
  const done = index >= round.length

  if (done) {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-4 py-8">
        <p className="text-sm font-medium text-[#8a5a12]">함정 10개</p>
        <h1 className="text-3xl font-semibold text-[#1d3e66]">
          {correct} / {round.length}
        </h1>
        <p className="leading-7 text-[#3d4a5c]">
          {correct === round.length
            ? "순서, 밑줄, 색, 학습이랑 시험을 다 갈랐다."
            : "틀린 함정은 해설의 그 줄을 다시 보면 된다. 코드 철자보다 이쪽을 선생님이 더 자주 틀린다."}
        </p>
        <div className="flex gap-2">
          <Button type="button" className="h-11" onClick={() => go({ name: "study" })}>
            해설로
          </Button>
          <Button type="button" variant="outline" className="h-11" onClick={() => go({ name: "home" })}>
            홈
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-4 py-6">
      <p className="text-sm font-medium text-[#8a5a12]">
        함정 {index + 1} / {round.length}
      </p>
      <h1 className="text-2xl font-semibold leading-snug text-[#1d3e66]">{card.ask}</h1>
      <div className="grid gap-2">
        {card.shuffled.map((choice) => {
          const told = picked !== null
          const isAnswer = choice === card.answer
          const isPicked = choice === picked
          let tone = "bg-[#fffaf1] ring-[#eadcbf]"
          if (told && isAnswer) tone = "bg-[#e7f6ec] ring-[#1f7a4d]"
          else if (told && isPicked) tone = "bg-[#fff1ee] ring-[#a33b32]"
          return (
            <button
              key={choice}
              type="button"
              disabled={told}
              onClick={() => {
                setPicked(choice)
                if (choice === card.answer) setCorrect((value) => value + 1)
              }}
              className={`rounded-2xl px-4 py-3 text-left ring-1 ${tone}`}
            >
              {choice}
            </button>
          )
        })}
      </div>
      {picked && (
        <div className="rounded-2xl bg-[#fff4d8] px-4 py-4">
          <p className="leading-7 text-[#3d3422]">{card.why}</p>
          <Button type="button" className="mt-3 h-11" onClick={() => {
            setIndex((value) => value + 1)
            setPicked(null)
          }}>
            {index + 1 === round.length ? "결과" : "다음 함정"}
          </Button>
        </div>
      )}
    </div>
  )
}
