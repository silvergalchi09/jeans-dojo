import { fitLine, jeansPoints } from "@/lib/content"

export function JeansChart() {
  const { slope, intercept } = fitLine(jeansPoints)
  const xOf = (neck: number) => 44 + ((neck - 33) / 12) * 292
  const yOf = (waist: number) => 188 - ((waist - 70) / 42) * 156
  const x1 = 33.2
  const x2 = 44.6
  const y1 = slope * x1 + intercept
  const y2 = slope * x2 + intercept

  return (
    <figure className="rounded-2xl bg-[#fffaf1] p-4 ring-1 ring-[#eadcbf]">
      <svg viewBox="0 0 360 230" className="h-auto w-full" role="img" aria-label="목둘레와 허리둘레 산점도">
        <line x1="44" y1="28" x2="44" y2="188" stroke="#d9c7a4" />
        <line x1="44" y1="188" x2="336" y2="188" stroke="#d9c7a4" />
        <line
          x1={xOf(x1)}
          y1={yOf(y1)}
          x2={xOf(x2)}
          y2={yOf(y2)}
          stroke="#c44536"
          strokeWidth="2.5"
        />
        {jeansPoints.map(([neck, waist]) => (
          <circle key={`${neck}-${waist}`} cx={xOf(neck)} cy={yOf(waist)} r="4.5" fill="#2a6fdb" />
        ))}
        <text x="168" y="214" fill="#6d6254" fontSize="12">
          neck
        </text>
        <text x="8" y="112" fill="#6d6254" fontSize="12" transform="rotate(-90 16 112)">
          waist
        </text>
      </svg>
      <figcaption className="mt-1 text-sm leading-6 text-[#5c5346]">
        파란 점은 실제 치수, 빨간 선은 그 점들에 맞춘 직선이다. 이 선의 기울기가{" "}
        <span className="font-mono text-[#1d3e66]">coef_</span>
        {` (${slope.toFixed(2)})`}, 목둘레가 0일 때의 값이{" "}
        <span className="font-mono text-[#1d3e66]">intercept_</span>
        {` (${intercept.toFixed(1)})`}다.
      </figcaption>
    </figure>
  )
}
