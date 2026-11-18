import Link from "next/link";

const LINKS = [
  { href: "/", label: "reviews" },
  { href: "/compare", label: "compare" },
  { href: "/methodology", label: "methodology" },
  { href: "/about", label: "about" },
];

export function SiteNav() {
  return (
    <nav className="flex items-center justify-between gap-4 border-b border-line px-5 py-5 sm:px-14">
      <Link href="/" className="font-mono text-[18px] font-bold tracking-[-0.02em] text-text">
        software<span className="text-neon">_</span>factories
      </Link>
      <div className="flex gap-4 font-mono text-[13px] text-mute sm:gap-7 sm:text-sm">
        {LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={`transition-colors hover:text-text ${l.label === "compare" || l.label === "methodology" ? "hidden sm:inline" : ""}`}
          >
            {l.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
