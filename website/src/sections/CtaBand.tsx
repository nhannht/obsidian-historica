import LinkButton from "@/components/LinkButton"
import ShinyText from "@/components/ShinyText"

export default function CtaBand() {
  return (
    <section id="install" className="relative px-4 py-24">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute bottom-[-160px] left-1/2 h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-blue/20 blur-[150px]" />
      </div>
      <div className="mx-auto max-w-3xl">
        {/* Paper, not glass: this card scrolls with the content layer. Persistent
            glass stays reserved for the two floating panes (nav pill, hero window). */}
        <div className="w-full rounded-[28px] border border-white/10 bg-panel shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_24px_60px_rgba(0,0,0,0.45)]">
          <div className="w-full px-6 py-12 text-center md:px-12">
            <h2 className="text-3xl font-semibold tracking-[-0.02em] md:text-[40px]">
              <ShinyText
                text="Put a timeline in your vault."
                speed={3}
                color="#e9ebf1"
                shineColor="#548af7"
              />
            </h2>
            <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-muted">
              Open Obsidian, search Community plugins for Historica, and drop a code fence into a
              note you already wrote. Or install manually from the latest GitHub release.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <LinkButton href="obsidian://show-plugin?id=historica" size="md">
                Install in Obsidian
              </LinkButton>
              <LinkButton
                href="https://github.com/nhannht/obsidian-historica/releases/latest"
                variant="ghost"
                size="md"
                external
              >
                Latest release
              </LinkButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
