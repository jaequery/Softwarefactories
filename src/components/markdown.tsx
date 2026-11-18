import type { ReactNode } from "react";

/**
 * A small, safe Markdown renderer for review bodies. It builds React elements only (never raw HTML),
 * so any HTML in the source is shown as text. Supported: paragraphs, `#`–`####` headings, `-`/`*`/`1.`
 * lists, `>` quotes, fenced code, `---`, and inline `**bold**`, `*italic*`, `` `code` `` and
 * `[links](https://…)`. Links only keep http(s), mailto and same-site paths; anything else renders as text.
 */

const SAFE_HREF = /^(https?:\/\/|mailto:|\/(?!\/)|#)/i;

const INLINE = /(`[^`\n]+`)|(\*\*[^*\n]+?\*\*|__[^_\n]+?__)|(\*[^*\s][^*\n]*?\*|_[^_\s][^_\n]*?_)|(\[[^\]\n]+\]\([^)\s]+\))/;

function inline(text: string, key = "i"): ReactNode[] {
  const out: ReactNode[] = [];
  let rest = text;
  let n = 0;
  while (rest) {
    const m = INLINE.exec(rest);
    if (!m) {
      out.push(rest);
      break;
    }
    if (m.index > 0) out.push(rest.slice(0, m.index));
    const tok = m[0];
    const k = `${key}-${n++}`;
    if (m[1]) {
      out.push(
        <code key={k} className="rounded bg-track px-1.5 py-0.5 font-mono text-[0.9em] text-cyan">
          {tok.slice(1, -1)}
        </code>,
      );
    } else if (m[2]) {
      out.push(
        <strong key={k} className="font-semibold text-text">
          {inline(tok.slice(2, -2), k)}
        </strong>,
      );
    } else if (m[3]) {
      out.push(<em key={k}>{inline(tok.slice(1, -1), k)}</em>);
    } else {
      const [, label, href] = /^\[([^\]]+)\]\(([^)\s]+)\)$/.exec(tok)!;
      if (SAFE_HREF.test(href)) {
        const external = /^https?:/i.test(href);
        out.push(
          <a
            key={k}
            href={href}
            className="text-cyan underline decoration-cyan/40 underline-offset-2 hover:decoration-cyan"
            {...(external ? { target: "_blank", rel: "noopener nofollow" } : {})}
          >
            {inline(label, k)}
          </a>,
        );
      } else {
        out.push(...inline(label, k));
      }
    }
    rest = rest.slice(m.index + tok.length);
  }
  return out;
}

type Block =
  | { kind: "p"; text: string }
  | { kind: "h"; level: number; text: string }
  | { kind: "ul" | "ol"; items: string[] }
  | { kind: "quote"; text: string }
  | { kind: "code"; text: string }
  | { kind: "hr" };

const UL = /^\s*[-*+]\s+(.*)$/;
const OL = /^\s*\d+[.)]\s+(.*)$/;

function parse(src: string): Block[] {
  const lines = src.replace(/\r\n?/g, "\n").split("\n");
  const blocks: Block[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) {
      i++;
      continue;
    }
    if (/^\s*```/.test(line)) {
      const body: string[] = [];
      i++;
      while (i < lines.length && !/^\s*```/.test(lines[i])) body.push(lines[i++]);
      i++;
      blocks.push({ kind: "code", text: body.join("\n") });
      continue;
    }
    const h = /^(#{1,6})\s+(.*?)\s*#*\s*$/.exec(line);
    if (h) {
      blocks.push({ kind: "h", level: h[1].length, text: h[2] });
      i++;
      continue;
    }
    if (/^\s*([-*_])(\s*\1){2,}\s*$/.test(line)) {
      blocks.push({ kind: "hr" });
      i++;
      continue;
    }
    const listRe = UL.test(line) ? UL : OL.test(line) ? OL : null;
    if (listRe) {
      const items: string[] = [];
      while (i < lines.length && lines[i].trim()) {
        const m = listRe.exec(lines[i]);
        if (m) items.push(m[1]);
        else items[items.length - 1] += ` ${lines[i].trim()}`;
        i++;
      }
      blocks.push({ kind: listRe === UL ? "ul" : "ol", items });
      continue;
    }
    if (/^\s*>/.test(line)) {
      const body: string[] = [];
      while (i < lines.length && /^\s*>/.test(lines[i])) body.push(lines[i++].replace(/^\s*>\s?/, ""));
      blocks.push({ kind: "quote", text: body.join(" ") });
      continue;
    }
    const para: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() &&
      !/^(#{1,6}\s|\s*```|\s*>)/.test(lines[i]) &&
      !UL.test(lines[i]) &&
      !OL.test(lines[i])
    ) {
      para.push(lines[i++].trim());
    }
    blocks.push({ kind: "p", text: para.join(" ") });
  }
  return blocks;
}

const HEADING_CLASS = ["", "text-2xl", "text-2xl", "text-xl", "text-lg", "text-base", "text-base"];

export function Markdown({ source, className = "" }: { source: string; className?: string }) {
  const blocks = parse(source);
  return (
    <div className={`flex flex-col gap-4 leading-relaxed text-text/85 ${className}`}>
      {blocks.map((b, idx) => {
        const k = `b${idx}`;
        switch (b.kind) {
          case "h": {
            // h1 in the body would compete with the page title, so body headings start at h2.
            const Tag = `h${Math.min(6, Math.max(2, b.level + 1))}` as "h2" | "h3" | "h4" | "h5" | "h6";
            return (
              <Tag key={k} className={`mt-2 font-bold tracking-[-0.02em] text-text ${HEADING_CLASS[b.level]}`}>
                {inline(b.text, k)}
              </Tag>
            );
          }
          case "ul":
          case "ol": {
            const List = b.kind;
            return (
              <List key={k} className={`flex flex-col gap-1.5 pl-6 ${b.kind === "ul" ? "list-disc" : "list-decimal"} marker:text-mute`}>
                {b.items.map((it, j) => (
                  <li key={j}>{inline(it, `${k}-${j}`)}</li>
                ))}
              </List>
            );
          }
          case "quote":
            return (
              <blockquote key={k} className="border-l-2 border-neon/50 pl-4 text-mute italic">
                {inline(b.text, k)}
              </blockquote>
            );
          case "code":
            return (
              <pre key={k} className="overflow-x-auto rounded-lg border border-line bg-panel p-4 font-mono text-[13px] text-text">
                <code>{b.text}</code>
              </pre>
            );
          case "hr":
            return <hr key={k} className="border-line" />;
          default:
            return <p key={k}>{inline(b.text, k)}</p>;
        }
      })}
    </div>
  );
}
