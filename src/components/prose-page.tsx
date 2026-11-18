import type { ReactNode } from "react";

/** Shell for static editorial pages (methodology, about). */
export function ProsePage({ kicker, title, lede, children, testid }: { kicker: string; title: string; lede: string; children: ReactNode; testid: string }) {
  return (
    <main className="px-5 pt-12 pb-16 sm:px-14 sm:pt-16" data-testid={testid}>
      <p className="mb-4 font-mono text-[13px] text-neon">{kicker}</p>
      <h1 className="max-w-[820px] text-[34px] leading-[1.05] font-bold tracking-[-0.035em] sm:text-5xl">{title}</h1>
      <p className="mt-4 max-w-[680px] text-base text-mute sm:text-lg">{lede}</p>
      <div className="prose-page mt-10 flex max-w-[720px] flex-col gap-5 leading-relaxed text-text/85">{children}</div>
    </main>
  );
}

export function H2({ children }: { children: ReactNode }) {
  return <h2 className="mt-6 text-2xl font-bold tracking-[-0.02em] text-text">{children}</h2>;
}
