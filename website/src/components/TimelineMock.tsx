/**
 * Faithful Int UI dark render of a Historica block (tokens from DESIGN.md):
 * a note in prose on the left, the parsed timeline on the right. Mock data
 * only - the layout mirrors the plugin's entry card, date chip, precision
 * gutter and significance bars.
 */

type Precision = "exact" | "approx"

interface MockEntry {
  date: string
  precision: Precision
  significance: number
  text: string
  anchor?: boolean
}

const ENTRIES: MockEntry[] = [
  {
    date: "1861-03-04",
    precision: "exact",
    significance: 4,
    text: "We left Marseille, chasing a rumor of the northern route.",
  },
  {
    date: "1861-04",
    precision: "approx",
    significance: 2,
    text: "The ice closed behind us; the crew took to naming the bergs.",
  },
  {
    date: "1861-05-12",
    precision: "exact",
    significance: 5,
    text: "The first gull came back. Nobody had spoken of home until then.",
    anchor: true,
  },
]

function DateChip({ date, precision, anchor }: Pick<MockEntry, "date" | "precision" | "anchor">) {
  const style = anchor
    ? "bg-orange/15 text-orange"
    : precision === "exact"
      ? "bg-[#25324D] text-[#8FB2F9]"
      : "border border-int-border text-int-muted"
  return (
    <span className={`inline-block rounded px-1.5 py-0.5 font-mono text-[11px] leading-4 ${style}`}>
      {date}
      {precision === "approx" && <span className="text-int-faint"> ~</span>}
    </span>
  )
}

function SignalBars({ level }: { level: number }) {
  return (
    <span className="flex items-end gap-[2px]" aria-label={`significance ${level} of 5`}>
      {[1, 2, 3, 4, 5].map(i => (
        <span
          key={i}
          style={{ height: 3 + i * 2 }}
          className={`w-[3px] rounded-sm ${i <= level ? "bg-blue" : "bg-int-border"}`}
        />
      ))}
    </span>
  )
}

function Highlight({ children }: { children: string }) {
  return <mark className="rounded bg-[#25324D] px-1 py-0.5 font-mono text-[0.85em] text-[#8FB2F9]">{children}</mark>
}

export default function TimelineMock() {
  return (
    <div className="grid overflow-hidden rounded-b-[19px] bg-int-surface text-left md:grid-cols-[1fr_1.15fr]">
      {/* Note pane: the prose the user wrote */}
      <div className="hidden border-r border-int-border p-5 md:block">
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-int-faint">
          notes/the-long-voyage.md
        </p>
        <p className="mt-4 font-serif text-[15px] leading-7 text-int-fg/90">
          We left Marseille on <Highlight>March 4, 1861</Highlight>, chasing a rumor of the
          northern route. By late <Highlight>April 1861</Highlight> the ice had closed behind
          us, and the crew took to naming the bergs. Nobody spoke of home until{" "}
          <Highlight>12 May</Highlight>, when the first gull came back.
        </p>
        <p className="mt-6 font-mono text-[11px] text-int-faint">
          ```historica
          <br />
          ```
        </p>
      </div>

      {/* Timeline pane: what Historica renders */}
      <div className="p-5">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-int-muted">
            Historica
          </span>
          <div className="flex gap-1 text-[11px] font-medium text-int-muted">
            <span className="rounded bg-int-panel px-2 py-1">Sort</span>
            <span className="rounded bg-int-panel px-2 py-1">Export</span>
            <span className="rounded bg-int-panel px-2 py-1 text-int-fg">+ Add</span>
          </div>
        </div>

        <ul className="mt-4 space-y-2">
          {ENTRIES.map(entry => (
            <li key={entry.date} className="flex gap-2.5">
              <span
                className={`mt-1 w-[3px] shrink-0 self-stretch rounded-full ${
                  entry.precision === "exact" ? "bg-blue" : "bg-blue/35"
                }`}
              />
              <div className="flex-1 rounded-md border border-int-border bg-int-panel px-3 py-2.5">
                <div className="flex items-center justify-between gap-2">
                  <DateChip {...entry} />
                  <SignalBars level={entry.significance} />
                </div>
                <p className="mt-1.5 text-[13px] leading-5 text-int-fg">{entry.text}</p>
                {entry.anchor && (
                  <span className="mt-1.5 inline-block rounded-sm bg-orange/15 px-1.5 font-mono text-[10px] uppercase tracking-[0.08em] text-orange">
                    ref
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>

        <p className="mt-4 font-mono text-[10px] text-int-faint">
          3 dated sentences · 1 unparsed · saved to historica-data/1992306556.md
        </p>
      </div>
    </div>
  )
}
