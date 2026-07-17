import { Eyebrow, Heading, Lead } from "@/components/Section"

export default function CodeBand() {
  return (
    <section className="px-4 py-24">
      <div className="mx-auto flex max-w-5xl flex-col items-center text-center">
        <Eyebrow>The setup</Eyebrow>
        <Heading>One code fence. That's it.</Heading>
        <Lead>
          Drop an empty <code className="font-mono text-fg">historica</code> block into any note.
          The plugin parses the prose around it and renders the timeline in place. No YAML per
          event, no separate database.
        </Lead>
        <div className="mt-10 w-full max-w-md overflow-hidden rounded-xl border border-int-border bg-int-surface text-left shadow-2xl shadow-black/40">
          <div className="border-b border-int-border px-4 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-int-faint">
            any-note.md
          </div>
          <pre className="px-4 py-4 font-mono text-[13px] leading-6 text-int-fg">
            <span className="text-int-faint">```</span>
            <span className="text-blue-bright">historica</span>
            {"\n"}
            <span className="text-int-faint">```</span>
          </pre>
        </div>
      </div>
    </section>
  )
}
