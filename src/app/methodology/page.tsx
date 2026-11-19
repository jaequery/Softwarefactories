import type { Metadata } from "next";
import Link from "next/link";
import { H2, ProsePage } from "@/components/prose-page";
import { SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: `Methodology: how we score · ${SITE_NAME}`,
  description: "What counts as an AI software factory, the four sub-scores we rate, and how the overall score is set.",
  openGraph: { title: `How we score · ${SITE_NAME}`, siteName: SITE_NAME },
};

const SUBS = [
  ["autonomy", "How far it gets on its own: from a ticket or issue to a reviewable change without hand-holding, including planning, running tests and recovering from its own mistakes."],
  ["quality", "Whether the code it ships is correct, idiomatic and maintainable, and whether it respects the existing codebase instead of rewriting around it."],
  ["speed", "Wall-clock time from task to usable result, and how much it can run in parallel."],
  ["value", "What you get for the money: plan prices, usage limits, bring-your-own-model options and how predictable the bill is."],
] as const;

export default function MethodologyPage() {
  return (
    <ProsePage
      testid="methodology"
      kicker="// methodology"
      title="How we score"
      lede="Every review rates a factory on four things, out of 10, and gives it an overall score. Here is what each one means and how they combine."
    >
      <H2>What counts as a software factory</H2>
      <p>
        A software factory is an AI agent or platform that takes a ticket, an issue or a task and works on it
        unattended: it reads the codebase, makes the change, runs it, and hands back a pull request or merged code.
        Out of scope: autocomplete and chat assistants, interactive coding tools you drive turn by turn in a terminal
        or editor (such as Claude Code, Codex CLI or Cursor), and prompt-to-app website and app builders.
      </p>

      <H2>The four sub-scores</H2>
      <dl className="flex flex-col gap-4" data-testid="sub-scores">
        {SUBS.map(([name, text]) => (
          <div key={name} className="rounded-xl border border-line bg-panel p-5">
            <dt className="font-mono text-sm text-neon">{name}</dt>
            <dd className="mt-1.5">{text}</dd>
          </div>
        ))}
      </dl>
      <p>Each sub-score runs from 0 to 10 in steps of 0.1. A 5 is usable with supervision; an 8 is something we would hand real work to; a 10 has no meaningful weakness on that axis today.</p>

      <H2>The overall score</H2>
      <p>
        The overall score is <strong className="text-text">set by hand by the editor</strong>; it is not computed
        automatically. Our starting point is an equal-weighted average of the four sub-scores, rounded to one decimal:
      </p>
      <pre className="overflow-x-auto rounded-lg border border-line bg-panel p-4 font-mono text-[13px] text-cyan" data-testid="formula">
        overall ≈ (autonomy + quality + speed + value) / 4
      </pre>
      <p>
        The editor may move the overall score away from that average when one weakness outweighs everything else
        (for example, an agent that is fast and cheap but routinely breaks builds). When that happens, the review says
        why.
      </p>

      <H2>Draft scores</H2>
      <p>
        Scores marked &ldquo;Draft score: pending hands-on review&rdquo; are provisional, based on each product&apos;s
        published capabilities and pricing, and will change once we have used the product on real work.
      </p>

      <H2>Editorial and independent</H2>
      <p>
        Reviews are written by the site&apos;s editor alone. Vendors do not pay for placement, cannot buy or preview
        scores, and do not see a review before it is published. There are no affiliate links. Every review shows the
        date it was last reviewed, and scores are revised when products change.
      </p>
      <p>
        <Link href="/compare" className="text-cyan hover:underline">
          Compare factories side by side →
        </Link>
      </p>
    </ProsePage>
  );
}
