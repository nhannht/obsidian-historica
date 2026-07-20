import { useEffect, useRef, useState } from "react"
import GlassSurface from "@/components/GlassSurface"
import LinkButton from "@/components/LinkButton"

const LINKS = [
  { label: "How it works", href: "#how" },
  { label: "Languages", href: "#languages" },
  { label: "HMD", href: "#hmd" },
  { label: "GitHub", href: "https://github.com/nhannht/obsidian-historica" },
]

export default function Nav() {
  const [menuOpen, setMenuOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!menuOpen) return
    const onPointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setMenuOpen(false)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false)
    }
    document.addEventListener("pointerdown", onPointerDown)
    document.addEventListener("keydown", onKeyDown)
    return () => {
      document.removeEventListener("pointerdown", onPointerDown)
      document.removeEventListener("keydown", onKeyDown)
    }
  }, [menuOpen])

  return (
    <header className="fixed inset-x-0 top-4 z-50 px-4">
      <div ref={containerRef} className="relative mx-auto max-w-5xl">
        <GlassSurface
          width="100%"
          height={56}
          borderRadius={28}
          backgroundOpacity={0.35}
          distortionScale={-45}
          greenOffset={4}
          blueOffset={8}
          displace={0.5}
        >
          <nav className="flex w-full items-center justify-between px-4" aria-label="Main">
            <a href="#top" className="flex items-center gap-2.5">
              <svg viewBox="0 0 32 32" className="h-6 w-6 rounded-md" aria-hidden="true">
                <rect width="32" height="32" rx="7" fill="#0B0E16" />
                <line x1="11" y1="9" x2="11" y2="23" stroke="#393B40" strokeWidth="2" />
                <circle cx="11" cy="9" r="3" fill="#3574F0" />
                <circle cx="11" cy="16" r="3" fill="#548AF7" />
                <circle cx="11" cy="23" r="3" fill="#E08855" />
                <rect x="17" y="7" width="9" height="4" rx="2" fill="#25324D" />
                <rect x="17" y="14" width="9" height="4" rx="2" fill="#25324D" />
                <rect x="17" y="21" width="9" height="4" rx="2" fill="#2B2D30" />
              </svg>
              <span className="text-[15px] font-semibold tracking-tight text-fg">Historica</span>
            </a>
            <div className="hidden items-center gap-7 md:flex">
              {LINKS.map(link => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-[13px] font-medium text-muted transition-colors hover:text-fg"
                  {...(link.href.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})}
                >
                  {link.label}
                </a>
              ))}
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setMenuOpen(open => !open)}
                aria-expanded={menuOpen}
                aria-controls="mobile-menu"
                aria-label={menuOpen ? "Close menu" : "Open menu"}
                className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border-none bg-transparent text-muted transition-colors hover:text-fg md:hidden"
              >
                <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" aria-hidden="true">
                  {menuOpen ? (
                    <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  ) : (
                    <path d="M2 5h12M2 11h12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  )}
                </svg>
              </button>
              <LinkButton href="#install" size="sm">
                Install
              </LinkButton>
            </div>
          </nav>
        </GlassSurface>
        {/* Paper sheet under the glass pill (apple.com mobile pattern) - the
            sheet is opaque, never glass: glass does not stack on glass. */}
        {menuOpen && (
          <div
            id="mobile-menu"
            className="absolute inset-x-0 top-[calc(100%+8px)] rounded-2xl border border-white/10 bg-panel p-2 shadow-[0_24px_60px_rgba(0,0,0,0.5)] md:hidden"
          >
            {LINKS.map(link => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="block rounded-xl px-4 py-3 text-[15px] font-medium text-fg transition-colors hover:bg-white/5"
                {...(link.href.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})}
              >
                {link.label}
              </a>
            ))}
          </div>
        )}
      </div>
    </header>
  )
}
