import MagicBento from "@/components/MagicBento"
import { Eyebrow, Heading, Lead } from "@/components/Section"

const FEATURES = [
  {
    label: "NLP",
    title: "NLP date extraction",
    description: "Days, months, centuries, eras, B.C.E and CJK forms - per-language chrono-node.",
  },
  {
    label: "i18n",
    title: "7 languages, auto-detected",
    description: "EN, DE, FR, JA, ZH, NL, VI - detection picks the right parser per note.",
  },
  {
    label: "Storage",
    title: "Plain-markdown storage",
    description: "Timelines persist as HMD: readable, diffable markdown you can edit by hand.",
  },
  {
    label: "Editing",
    title: "Edit in place",
    description: "Add, edit, re-date, sort and annotate in place. Manual edits survive re-parses.",
  },
  {
    label: "Vault",
    title: "A vault-wide view",
    description: "The global timeline gathers every note's events into one spine with a heatmap.",
  },
  {
    label: "Export",
    title: "Export anywhere",
    description: "JSON for tools, PNG for sharing, markdown for everything else.",
  },
]

export default function Features() {
  return (
    <section id="features" className="relative px-4 py-24">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute right-[-200px] top-10 h-[600px] w-[600px] rounded-full bg-violet/15 blur-[160px]" />
      </div>
      <div className="mx-auto max-w-5xl">
        <Eyebrow>What you get</Eyebrow>
        <Heading>A timeline engine, not a widget.</Heading>
        <Lead>
          Everything runs inside your vault. Parsing is local, storage is markdown, and the
          renderer is a React block that lives in your note.
        </Lead>
        <div className="mt-12 flex justify-center">
          <MagicBento
            cards={FEATURES.map(feature => ({ ...feature, color: "#0b0e16" }))}
            textAutoHide={false}
            glowColor="53, 116, 240"
            particleCount={8}
            enableTilt={false}
            enableMagnetism={false}
            spotlightRadius={320}
          />
        </div>
      </div>
    </section>
  )
}
