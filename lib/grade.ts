export type Mistake = {
  test: (value: string) => boolean
  message: string
}

export type Blank = {
  id: string
  label: string
  answer: string
  accept?: string[]
  hint: string
  mistakes?: Mistake[]
}

export type Grade = {
  ok: boolean
  message?: string
}

export function normalizeAnswer(raw: string): string {
  let value = raw.normalize("NFKC").trim()
  value = value.replace(/[‘’′´`]/g, "'")
  value = value.replace(/[“”]/g, '"')
  value = value.replace(/"/g, "'")
  value = value.replace(/，/g, ",")
  value = value.replace(/：/g, ":")
  value = value.replace(/\s+/g, " ")
  value = value.replace(/\s*_\s*/g, "_")
  value = value.replace(/\s*([(),[\]=:+\-*/])\s*/g, "$1")
  value = value.replace(/\s*\.\s*/g, ".")
  return value
}

function acceptedForms(blank: Blank): string[] {
  return [blank.answer, ...(blank.accept ?? [])].map(normalizeAnswer)
}

export function gradeBlank(raw: string, blank: Blank): Grade {
  const value = normalizeAnswer(raw)
  if (!value) return { ok: false, message: "칸이 비어 있어." }

  const accepted = acceptedForms(blank)
  if (accepted.includes(value)) return { ok: true }

  if (value.endsWith(";")) {
    return { ok: false, message: "세미콜론은 빼. 이 코드는 파이썬이야." }
  }

  if (
    accepted.some((answer) => answer.toLowerCase() === value.toLowerCase())
  ) {
    return {
      ok: false,
      message: "철자는 맞다. 대소문자만 다르다. 파이썬은 그걸 다른 이름으로 본다.",
    }
  }

  if (
    accepted.some(
      (answer) =>
        answer.includes("_") &&
        !value.includes("_") &&
        answer.replace(/_/g, "") === value.replace(/_/g, ""),
    )
  ) {
    return { ok: false, message: "밑줄 _ 이 빠졌어." }
  }

  const mistake = blank.mistakes?.find((item) => item.test(value))
  if (mistake) return { ok: false, message: mistake.message }

  const answerHasQuote = accepted.some((answer) => answer.includes("'"))
  if (answerHasQuote && !value.includes("'")) {
    return { ok: false, message: "글자라서 따옴표가 필요해. 작은따옴표로 감싸 봐." }
  }
  if (!answerHasQuote && value.includes("'")) {
    return { ok: false, message: "이 칸은 따옴표 없이 이름만 쓴다." }
  }

  return {
    ok: false,
    message: "아직 아니야. 밑줄, 대소문자, 철자를 다시 보자.",
  }
}

export function maskAnswer(answer: string): string {
  const chars = [...answer]
  const alnumIndexes: number[] = []
  chars.forEach((char, index) => {
    if (/[A-Za-z0-9]/.test(char)) alnumIndexes.push(index)
  })
  const keep = new Set<number>()
  if (alnumIndexes.length) keep.add(alnumIndexes[0])
  if (alnumIndexes.length > 2) keep.add(alnumIndexes[alnumIndexes.length - 1])
  return chars
    .map((char, index) => {
      if (!/[A-Za-z0-9]/.test(char)) return char
      return keep.has(index) ? char : "·"
    })
    .join("")
}
