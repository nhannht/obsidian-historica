import LogoLoop from "@/components/LogoLoop"
import { Eyebrow, Heading, Lead } from "@/components/Section"

const SAMPLES = [
  { lang: "EN", date: "March 4, 1861" },
  { lang: "DE", date: "4. März 1861" },
  { lang: "FR", date: "4 mars 1861" },
  { lang: "JA", date: "1861年3月4日" },
  { lang: "ZH", date: "公元前221年" },
  { lang: "NL", date: "4 maart 1861" },
  { lang: "VI", date: "ngày 2 tháng 9 năm 1945" },
  { lang: "EN", date: "12th century B.C.E" },
]

const LOGOS = SAMPLES.map(sample => ({
  node: (
    <span className="flex items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2">
      <span className="font-mono text-[10px] font-semibold tracking-[0.14em] text-blue-bright">
        {sample.lang}
      </span>
      <span className="font-mono text-[13px] text-fg">{sample.date}</span>
    </span>
  ),
  title: `${sample.lang}: ${sample.date}`,
}))

export default function LanguagesBand() {
  return (
    <section id="languages" className="px-4 py-24">
      <div className="mx-auto max-w-5xl text-center">
        <div className="flex flex-col items-center">
          <Eyebrow>Seven languages</Eyebrow>
          <Heading>Dates in the language you think in.</Heading>
          <Lead>
            Parsing is tested against real annotated corpora - WikiWarsDE, WikiWars-NL, French
            FTiB and hand-curated Japanese and Chinese sets - not just regexes and hope.
          </Lead>
        </div>
      </div>
      <div className="mx-auto mt-12 max-w-5xl">
        <LogoLoop
          logos={LOGOS}
          speed={50}
          gap={16}
          logoHeight={36}
          pauseOnHover
          fadeOut
          fadeOutColor="#05070c"
          ariaLabel="Example dates Historica parses in seven languages"
        />
      </div>
    </section>
  )
}
