import assert from "node:assert/strict"
import { test } from "node:test"
import { questions, sheetSections } from "./content"
import { gradeBlank, normalizeAnswer } from "./grade"

test("spaces, quotes, and commas collapse", () => {
  assert.equal(normalizeAnswer("  test_size = 0.3 "), "test_size=0.3")
  assert.equal(normalizeAnswer('"jeans.csv"'), "'jeans.csv'")
  assert.equal(normalizeAnswer("-1, 1"), "-1,1")
  assert.equal(
    normalizeAnswer("X_train, X_test, y_train, y_test"),
    "X_train,X_test,y_train,y_test",
  )
})

test("every practice answer is accepted", () => {
  for (const question of questions) {
    for (const item of question.blanks) {
      const graded = gradeBlank(item.answer, item)
      assert.equal(graded.ok, true, `${question.id}:${item.id}`)
      for (const alias of item.accept ?? []) {
        assert.equal(gradeBlank(alias, item).ok, true, `${question.id}:${item.id}:${alias}`)
      }
    }
  }
})

test("every sheet answer is accepted", () => {
  for (const section of sheetSections) {
    for (const item of section.blanks) {
      assert.equal(gradeBlank(item.answer, item).ok, true, `${section.id}:${item.id}`)
    }
  }
})

test("templates only mention blanks that exist, once each on a sheet", () => {
  for (const question of questions) {
    const ids = [...question.template.matchAll(/\{\{([^}]+)\}\}/g)].map((match) => match[1])
    for (const id of ids) {
      assert.ok(question.blanks.some((item) => item.id === id), `${question.id}:${id}`)
    }
  }
  const sheetIds = sheetSections.flatMap((section) => {
    const ids = [...section.template.matchAll(/\{\{([^}]+)\}\}/g)].map((match) => match[1])
    for (const id of ids) {
      assert.ok(section.blanks.some((item) => item.id === id), `${section.id}:${id}`)
    }
    assert.equal(new Set(ids).size, ids.length, section.id)
    return section.blanks.map((item) => item.id)
  })
  assert.equal(new Set(sheetIds).size, sheetIds.length)
})

test("case, underscore, and swaps get a specific note", () => {
  const pandas = questions.find((question) => question.id === "import-pandas")
  assert.ok(pandas)
  const lib = pandas.blanks[0]
  assert.match(gradeBlank("Pandas", lib).message ?? "", /대소문자/)
  assert.match(gradeBlank("pd", lib).message ?? "", /별명/)

  const read = questions.find((question) => question.id === "read-csv")
  assert.ok(read)
  assert.match(gradeBlank("readcsv", read.blanks[0]).message ?? "", /밑줄/)

  const neck = questions.find((question) => question.id === "x-column")
  assert.ok(neck)
  assert.match(gradeBlank("'waist'", neck.blanks[0]).message ?? "", /허리/)

  const order = questions.find((question) => question.id === "unpack")
  assert.ok(order)
  assert.match(
    gradeBlank("X_test, X_train, y_train, y_test", order.blanks[0]).message ?? "",
    /순서/,
  )
})
