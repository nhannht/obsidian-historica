const LINKS = [
  { label: "GitHub", href: "https://github.com/nhannht/obsidian-historica" },
  { label: "Releases", href: "https://github.com/nhannht/obsidian-historica/releases" },
  { label: "HMD spec", href: "https://github.com/nhannht/obsidian-historica/blob/master/docs/hmd-spec.md" },
  { label: "Obsidian", href: "https://obsidian.md" },
]

export default function Footer() {
  return (
    <footer className="border-t border-white/10 px-4 py-12">
      <div className="mx-auto flex max-w-5xl flex-col items-start justify-between gap-8 md:flex-row md:items-center">
        <div>
          <p className="text-[15px] font-semibold tracking-tight text-fg">Historica</p>
          <p className="mt-1 max-w-sm text-[13px] leading-relaxed text-muted">
            Your writing already contains a timeline. Historica finds it.
          </p>
        </div>
        <nav className="flex flex-wrap gap-6" aria-label="Footer">
          {LINKS.map(link => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noreferrer"
              className="text-[13px] font-medium text-muted transition-colors hover:text-fg"
            >
              {link.label}
            </a>
          ))}
        </nav>
        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-faint">
          MIT · built by nhannht
        </p>
      </div>
    </footer>
  )
}
