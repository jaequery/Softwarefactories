import Link from "next/link";
import type { ReactNode } from "react";

export function Placeholder({ kicker, title, children }: { kicker: string; title: string; children?: ReactNode }) {
  return (
    <main className="px-5 py-16 sm:px-14">
      <p className="mb-4 font-mono text-[13px] text-neon">{kicker}</p>
      <h1 className="max-w-[820px] text-4xl font-extrabold tracking-[-0.03em] sm:text-5xl">{title}</h1>
      <div className="mt-5 max-w-[640px] text-mute">{children ?? <p>This page is coming soon.</p>}</div>
      <Link href="/" className="mt-8 inline-block font-mono text-[13px] text-cyan hover:underline">
        ← back to all reviews
      </Link>
    </main>
  );
}
