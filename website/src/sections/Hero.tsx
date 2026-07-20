import GlassSurface from "@/components/GlassSurface"
import LinkButton from "@/components/LinkButton"
import TimelineMock from "@/components/TimelineMock"

export default function Hero() {
  return (
    <section id="top" className="relative overflow-hidden px-4 pb-24 pt-40">
      {/* Hero brand glows (the Threads animation is a viewport-fixed layer in App) */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-40 top-24 h-[560px] w-[560px] rounded-full bg-blue/20 blur-[140px]" />
        <div className="absolute -top-52 right-[-180px] h-[640px] w-[640px] rounded-full bg-violet/20 blur-[160px]" />
      </div>

      <div className="mx-auto max-w-5xl text-center">
        <h1 className="mx-auto max-w-4xl text-[44px] font-semibold leading-[1.06] tracking-[-0.03em] text-fg md:text-[68px]">
          Turn <em className="font-serif font-normal italic tracking-normal">prose</em> into a{" "}
          <span className="inline-block rounded-2xl border border-blue/25 bg-blue/15 px-3 font-mono text-[0.8em] font-medium tracking-tight text-blue-bright md:px-4">
            timeline
          </span>
          , automatically.
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted">
          Historica is an Obsidian plugin that reads your notes, finds every date with NLP, and
          renders an interactive timeline - right inside a code block.
        </p>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <LinkButton href="obsidian://show-plugin?id=historica" size="md">
            Install in Obsidian
          </LinkButton>
          <LinkButton
            href="https://github.com/nhannht/obsidian-historica"
            variant="ghost"
            size="md"
            external
          >
            View on GitHub
          </LinkButton>
        </div>
        <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.18em] text-faint">
          Free and open source · MIT · Obsidian desktop · v0.4.0
        </p>
      </div>

      {/* The one signature element: a liquid-glass macOS window holding a
          faithful Int UI render of prose becoming a timeline. */}
      <div className="relative mx-auto mt-20 max-w-5xl">
        <GlassSurface
          width="100%"
          height="auto"
          borderRadius={22}
          backgroundOpacity={0.2}
          distortionScale={-60}
          greenOffset={5}
          blueOffset={10}
          className="glass-frosted"
        >
          <div className="w-full overflow-hidden rounded-[21px]">
            <div className="flex items-center gap-2 px-4 py-3">
              <span aria-hidden="true" className="h-3 w-3 rounded-full bg-[#FF5F57]" />
              <span aria-hidden="true" className="h-3 w-3 rounded-full bg-[#FEBC2E]" />
              <span aria-hidden="true" className="h-3 w-3 rounded-full bg-[#28C840]" />
              <span className="mx-auto -translate-x-4 font-mono text-[11px] text-muted">
                The Long Voyage.md - Obsidian
              </span>
            </div>
            <TimelineMock />
          </div>
        </GlassSurface>
      </div>
    </section>
  )
}
