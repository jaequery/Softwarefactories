import type { Metadata } from "next";
import Link from "next/link";
import { H2, ProsePage } from "@/components/prose-page";
import { SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: `About · ${SITE_NAME}`,
  description: "Software Factories publishes independent, editorial reviews of AI software factories.",
  openGraph: { title: `About · ${SITE_NAME}`, siteName: SITE_NAME },
};

export default function AboutPage() {
  return (
    <ProsePage
      testid="about"
      kicker="// about"
      title="About Software Factories"
      lede="An independent guide to the AI agents and platforms that turn tickets and prompts into shipped code."
    >
      <p>
        New AI software factories launch every month, and their landing pages all promise the same thing. This site
        exists to cut through that: one place that lists them, scores them on the same four axes, and says plainly
        what each one is good and bad at.
      </p>
      <p>
        Only the site&apos;s editor writes reviews; visitors read them. Scores follow the{" "}
        <Link href="/methodology" className="text-cyan hover:underline">
          published methodology
        </Link>
        , and no vendor pays for placement.
      </p>
      <H2>Contact</H2>
      <p data-testid="contact">
        Spotted something out of date, or want a factory reviewed? Contact: <span className="font-mono text-mute">[contact email coming soon]</span>
      </p>
    </ProsePage>
  );
}
