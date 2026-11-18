import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminBar } from "@/components/admin/admin-bar";
import { DeleteFactoryButton } from "@/components/admin/delete-factory-button";
import { FactoryForm } from "@/components/admin/factory-form";
import { formatDate } from "@/components/review-parts";
import { requireAdminPage } from "@/lib/admin/auth";
import { getAdminFactory } from "@/lib/admin/data";

export const dynamic = "force-dynamic";

export default async function EditFactoryPage({ params, searchParams }: PageProps<"/admin/factories/[id]">) {
  await requireAdminPage();
  const [{ id: rawId }, sp] = await Promise.all([params, searchParams]);
  if (!/^[1-9]\d{0,9}$/.test(rawId)) notFound();
  const factory = await getAdminFactory(Number(rawId));
  if (!factory) notFound();
  const { values } = factory;

  return (
    <main data-testid="admin-edit-page" data-id={factory.id}>
      <AdminBar title={values.name} back />
      {sp.saved && (
        <p className="mb-6 rounded-lg border border-neon/40 bg-neon/5 px-4 py-3 font-mono text-[13px] text-neon" role="status" data-testid="flash">
          Saved. {values.published ? "Live on the public site." : "Draft: not shown on the public site."}
        </p>
      )}
      <div className="mb-6 flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-[13px] text-mute">
        <span data-testid="timestamps">
          updated {formatDate(factory.updatedAt)}
          {factory.reviewedAt && ` · reviewed ${formatDate(factory.reviewedAt)}`}
        </span>
        {values.published && (
          <Link href={`/factories/${values.slug}`} className="text-cyan hover:underline" data-testid="view-public">
            view public page ↗
          </Link>
        )}
      </div>
      <FactoryForm id={factory.id} initial={values} />
      <section className="mt-12 rounded-xl border border-pink/30 p-5" data-testid="danger-zone">
        <h2 className="font-mono text-xs tracking-[0.08em] text-pink uppercase">danger zone</h2>
        <p className="mt-2 mb-4 text-sm text-mute">Deleting removes the factory and its review from the database and the public site.</p>
        <DeleteFactoryButton id={factory.id} name={values.name} />
      </section>
    </main>
  );
}
