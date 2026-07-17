import GlassSurface from "@/components/GlassSurface"
import LinkButton from "@/components/LinkButton"

const LINKS = [
  { label: "How it works", href: "#how" },
  { label: "Languages", href: "#languages" },
  { label: "HMD", href: "#hmd" },
  { label: "GitHub", href: "https://github.com/nhannht/obsidian-historica" },
]

export default function Nav() {
  return (
    <header className="fixed inset-x-0 top-4 z-50 px-4">
      <div className="mx-auto max-w-5xl">
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
            <LinkButton href="#install" size="sm">
              Install
            </LinkButton>
          </nav>
        </GlassSurface>
      </div>
    </header>
  )
}
