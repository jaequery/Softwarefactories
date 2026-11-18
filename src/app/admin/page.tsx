import Link from "next/link";
import { AdminBar } from "@/components/admin/admin-bar";
import { requireAdminPage } from "@/lib/admin/auth";
import { listAdminFactories } from "@/lib/admin/data";
import { categoryLabel } from "@/lib/factories";
import { formatDate } from "@/components/review-parts";

export const dynamic = "force-dynamic";

export default async function AdminHome({ searchParams }: PageProps<"/admin">) {
  await requireAdminPage();
  const [rows, sp] = await Promise.all([listAdminFactories(), searchParams]);
  const published = rows.filter((r) => r.published === 1).length;

  return (
    <main data-testid="admin-home">
      <AdminBar title="Factories" />
      {sp.deleted && (
        <p className="mb-6 rounded-lg border border-pink/40 bg-pink/5 px-4 py-3 font-mono text-[13px] text-pink" role="status" data-testid="flash">
          Factory deleted.
        </p>
      )}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <p className="font-mono text-[13px] text-mute" data-testid="admin-counts">
          {`${rows.length} factories · ${published} published · ${rows.length - published} drafts`}
        </p>
        <Link
          href="/admin/factories/new"
          data-testid="new-factory"
          className="rounded-lg bg-neon px-4 py-2 font-mono text-sm font-bold text-bg transition-opacity hover:opacity-90"
        >
          + new factory
        </Link>
      </div>
      <div className="overflow-x-auto rounded-xl border border-line bg-panel">
        <table className="w-full min-w-[760px] text-left text-sm" data-testid="admin-table">
          <thead className="border-b border-line font-mono text-xs tracking-[0.08em] text-mute uppercase">
            <tr>
              <th className="px-4 py-3 font-normal">name</th>
              <th className="px-4 py-3 font-normal">category</th>
              <th className="px-4 py-3 text-right font-normal">score</th>
              <th className="px-4 py-3 font-normal">status</th>
              <th className="px-4 py-3 font-normal">updated</th>
              <th className="px-4 py-3 text-right font-normal">actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-line last:border-0" data-testid="admin-row" data-slug={r.slug} data-id={r.id}>
                <td className="px-4 py-3 font-semibold">
                  {r.name}
                  {r.editors_pick === 1 && (
                    <span className="ml-2 font-mono text-xs font-normal text-amber" data-testid="admin-pick">
                      ★ editor&apos;s pick
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 font-mono text-[13px] text-cyan">{categoryLabel(r.category)}</td>
                <td className="px-4 py-3 text-right font-mono text-neon" data-testid="admin-score">
                  {r.overall_score === null ? "—" : r.overall_score.toFixed(1)}
                </td>
                <td className="px-4 py-3 font-mono text-[13px]" data-testid="admin-status">
                  {r.published === 1 ? <span className="text-neon">published</span> : <span className="text-mute">draft</span>}
                </td>
                <td className="px-4 py-3 font-mono text-[13px] text-mute">{formatDate(r.updated_at)}</td>
                <td className="px-4 py-3 text-right font-mono text-[13px] whitespace-nowrap">
                  <Link href={`/admin/factories/${r.id}`} className="text-cyan hover:underline" data-testid="admin-edit">
                    edit
                  </Link>
                  {r.published === 1 && (
                    <Link href={`/factories/${r.slug}`} className="ml-4 text-mute hover:text-text" data-testid="admin-view">
                      view ↗
                    </Link>
                  )}
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center font-mono text-[13px] text-mute">
                  {"// no factories yet"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
