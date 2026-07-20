import { Eyebrow, Heading, Lead } from "@/components/Section"

const SHOTS = [
  {
    src: "/shots/plugin-entry-cards.png",
    alt: "Expanded entry cards with date chips, significance sliders and annotation fields",
    caption: "Expanded cards - significance sliders, notes, attachments.",
  },
  {
    src: "/shots/plugin-context-menu.png",
    alt: "Per-entry right-click context menu: jump to source, add attachment, hide, mark as anchor, dismiss",
    caption: "Right-click an entry - jump to source, attach, anchor, dismiss.",
  },
]

function Frame({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
      <img src={src} alt={alt} loading="lazy" className="block w-full h-auto" />
    </div>
  )
}

export default function ShowcaseBand() {
  return (
    <section id="showcase" className="px-4 py-24">
      <div className="mx-auto max-w-5xl">
        <Eyebrow>In action</Eyebrow>
        <Heading>Real screenshots, not mocks.</Heading>
        <Lead>
          A plain history note above, the timeline Historica parsed out of it below - captured
          straight from Obsidian, dark theme, zero manual input.
        </Lead>
        <div className="mt-12 flex flex-col gap-4">
          <Frame
            src="/shots/plugin-timeline.png"
            alt="A WW2 note in Obsidian: prose paragraphs above, the Historica timeline block parsed from them below"
          />
          <div className="grid gap-4 md:grid-cols-2">
            {SHOTS.map(shot => (
              <figure key={shot.src} className="flex flex-col gap-2">
                <Frame src={shot.src} alt={shot.alt} />
                <figcaption className="px-1 text-sm leading-relaxed text-muted">
                  {shot.caption}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
