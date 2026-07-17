import CountUp from "@/components/CountUp"
import StarBorder from "@/components/StarBorder"
import { Eyebrow } from "@/components/Section"

const STATS = [
  { value: 226, label: "tests passing" },
  { value: 323, label: "assertions" },
  { value: 7, label: "languages" },
  { value: 0, label: "cloud calls" },
]

export default function StatsBand() {
  return (
    <section className="px-4 py-24">
      <div className="mx-auto max-w-5xl">
        <StarBorder as="div" color="#548af7" speed="8s" className="block! w-full rounded-3xl">
          <div className="px-6 py-12 text-center md:px-12">
        <Eyebrow>Honest numbers</Eyebrow>
        <div className="mt-8 grid grid-cols-2 gap-8 md:grid-cols-4">
          {STATS.map(stat => (
            <div key={stat.label}>
              <div className="font-mono text-4xl font-semibold tracking-tight text-fg md:text-5xl">
                <CountUp to={stat.value} duration={1.2} />
              </div>
              <p className="mt-2 text-[13px] font-medium uppercase tracking-[0.12em] text-muted">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
            <p className="mt-8 font-mono text-[11px] text-faint">
              From this repo's bun test run, v0.4.0. Parsing is fully local: your notes never
              leave your vault.
            </p>
          </div>
        </StarBorder>
      </div>
    </section>
  )
}
