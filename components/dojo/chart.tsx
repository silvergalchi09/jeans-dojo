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

export function PenguinTree() {
  return (
    <figure className="rounded-2xl bg-[#fffaf1] p-4 ring-1 ring-[#eadcbf]">
      <svg viewBox="0 0 360 210" className="h-auto w-full" role="img" aria-label="결정트리 두 층의 개념도">
        <line x1="180" y1="42" x2="96" y2="92" stroke="#c4842a" strokeWidth="2" />
        <line x1="180" y1="42" x2="264" y2="92" stroke="#c4842a" strokeWidth="2" />
        <line x1="96" y1="108" x2="48" y2="156" stroke="#1d3e66" strokeWidth="2" />
        <line x1="96" y1="108" x2="144" y2="156" stroke="#1d3e66" strokeWidth="2" />
        <line x1="264" y1="108" x2="216" y2="156" stroke="#1d3e66" strokeWidth="2" />
        <line x1="264" y1="108" x2="312" y2="156" stroke="#1d3e66" strokeWidth="2" />
        <rect x="132" y="16" width="96" height="32" rx="8" fill="#1c3d4a" />
        <text x="180" y="37" textAnchor="middle" fill="#f6efe4" fontSize="13">
          치수
        </text>
        <rect x="58" y="84" width="76" height="28" rx="8" fill="#2f6f8f" />
        <rect x="226" y="84" width="76" height="28" rx="8" fill="#2f6f8f" />
        <text x="96" y="103" textAnchor="middle" fill="#f6efe4" fontSize="12">
          갈림
        </text>
        <text x="264" y="103" textAnchor="middle" fill="#f6efe4" fontSize="12">
          갈림
        </text>
        {([48, 144, 216, 312] as const).map((x) => (
          <rect key={x} x={x - 28} y="152" width="56" height="26" rx="8" fill="#f0d7a2" />
        ))}
        <text x="48" y="169" textAnchor="middle" fill="#1d3e66" fontSize="11">
          종
        </text>
        <text x="144" y="169" textAnchor="middle" fill="#1d3e66" fontSize="11">
          종
        </text>
        <text x="216" y="169" textAnchor="middle" fill="#1d3e66" fontSize="11">
          종
        </text>
        <text x="312" y="169" textAnchor="middle" fill="#1d3e66" fontSize="11">
          종
        </text>
      </svg>
      <figcaption className="mt-1 text-sm leading-6 text-[#5c5346]">
        결정트리는 치수로 갈라져 종을 고른다. <span className="font-mono text-[#1d3e66]">max_depth=2</span>
        면 이 그림처럼 두 층만 그리고, <span className="font-mono text-[#1d3e66]">filled=True</span>
        면 칸에 색이 찬다. 칸 이름은 <span className="font-mono text-[#1d3e66]">X.columns</span>다.
      </figcaption>
    </figure>
  )
}
