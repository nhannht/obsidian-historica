import SpotlightCard from "@/components/SpotlightCard"
import { Eyebrow, Heading, Lead } from "@/components/Section"

const HMD_SOURCE = `---
blockId: "1992306556"
---

## We left Marseille

date:: 1861-03-04
significance:: 4
source:: notes/the-long-voyage.md

We left Marseille, chasing a rumor
of the northern route.`

export default function HmdBand() {
  return (
    <section id="hmd" className="px-4 py-24">
      <div className="mx-auto max-w-5xl">
        <Eyebrow>Storage</Eyebrow>
        <Heading>Your timeline is a markdown file.</Heading>
        <Lead>
          No database, no binary blob. Every timeline saves as HMD - a strict subset of markdown
          with YAML frontmatter and inline fields. Read it, diff it, grep it, edit it by hand;
          it round-trips byte-identically.
        </Lead>
        <div className="mt-12 grid gap-4 md:grid-cols-2">
          <div className="overflow-hidden rounded-xl border border-int-border bg-int-surface">
            <div className="border-b border-int-border px-4 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-int-faint">
              historica-data/1992306556.md
            </div>
            <pre className="overflow-x-auto px-4 py-4 font-mono text-[12.5px] leading-6 text-int-fg">
              {HMD_SOURCE}
            </pre>
          </div>
          <SpotlightCard
            className="flex flex-col justify-center gap-4 rounded-xl! border-white/10! bg-white/[0.03]! p-6!"
            spotlightColor="rgba(53, 116, 240, 0.15)"
          >
            <div className="flex gap-2.5">
              <span className="mt-1 w-[3px] shrink-0 self-stretch rounded-full bg-blue" />
              <div className="flex-1 rounded-md border border-int-border bg-int-panel px-3 py-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-block rounded bg-[#25324D] px-1.5 py-0.5 font-mono text-[11px] leading-4 text-[#8FB2F9]">
                    1861-03-04
                  </span>
                  <span className="flex items-end gap-[2px]" aria-hidden="true">
                    {[1, 2, 3, 4, 5].map(i => (
                      <span
                        key={i}
                        style={{ height: 3 + i * 2 }}
                        className={`w-[3px] rounded-sm ${i <= 4 ? "bg-blue" : "bg-int-border"}`}
                      />
                    ))}
                  </span>
                </div>
                <p className="mt-1.5 text-[13px] leading-5 text-int-fg">
                  We left Marseille, chasing a rumor of the northern route.
                </p>
              </div>
            </div>
            <p className="text-[14px] leading-relaxed text-muted">
              The same entry, rendered. Frontmatter holds the block settings, one H2 per event,
              inline fields for date and significance, prose as the body. Unknown fields survive
              round-trips.
            </p>
            <a
              href="https://github.com/nhannht/obsidian-historica/blob/master/docs/hmd-spec.md"
              target="_blank"
              rel="noreferrer"
              className="font-mono text-[12px] font-medium uppercase tracking-[0.14em] text-blue-bright transition-colors hover:text-fg"
            >
              Read the HMD spec
            </a>
          </SpotlightCard>
        </div>
      </div>
    </section>
  )
}
