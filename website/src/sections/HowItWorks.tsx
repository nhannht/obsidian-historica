import PixelCard from "@/components/PixelCard"
import { Eyebrow, Heading } from "@/components/Section"

const STEPS = [
  {
    n: "01",
    title: "Write like you write",
    body: "No special syntax and no forms. Prose with dates in it is already the input - your existing notes qualify.",
  },
  {
    n: "02",
    title: "Historica parses it",
    body: "chrono-node plus custom parsers for centuries, eras, B.C.E dates and CJK forms extract every dated sentence, in the note's own language.",
  },
  {
    n: "03",
    title: "A timeline renders",
    body: "Interactive entries you can edit, sort and annotate. Saved beside your notes as plain markdown, not a binary blob.",
  },
]

export default function HowItWorks() {
  return (
    <section id="how" className="px-4 py-24">
      <div className="mx-auto max-w-5xl">
        <Eyebrow>How it works</Eyebrow>
        <Heading>From sentences to spine in three steps.</Heading>
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {STEPS.map(step => (
            <PixelCard
              key={step.n}
              variant="blue"
              className="h-[280px]! w-full! aspect-auto! rounded-2xl! border-white/10! bg-white/[0.02]"
            >
              <div className="absolute inset-0 flex flex-col justify-end p-6 text-left">
                <span className="font-mono text-[11px] font-semibold tracking-[0.18em] text-blue-bright">
                  {step.n}
                </span>
                <h3 className="mt-3 text-lg font-semibold text-fg">{step.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-muted">{step.body}</p>
              </div>
            </PixelCard>
          ))}
        </div>
      </div>
    </section>
  )
}
