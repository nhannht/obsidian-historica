import type { ReactNode } from "react"

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-blue-bright">
      {children}
    </p>
  )
}

export function Heading({ children }: { children: ReactNode }) {
  return (
    <h2 className="mt-3 text-3xl font-semibold tracking-[-0.02em] text-fg md:text-[40px] md:leading-[1.15]">
      {children}
    </h2>
  )
}

export function Lead({ children }: { children: ReactNode }) {
  return <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted md:text-lg">{children}</p>
}
