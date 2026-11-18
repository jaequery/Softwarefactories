import { AdminBar } from "@/components/admin/admin-bar";
import { FactoryForm } from "@/components/admin/factory-form";
import { requireAdminPage } from "@/lib/admin/auth";
import { EMPTY_FORM } from "@/lib/admin/schema";

export const dynamic = "force-dynamic";

export default async function NewFactoryPage() {
  await requireAdminPage();
  return (
    <main data-testid="admin-new">
      <AdminBar title="New factory" back />
      <FactoryForm initial={EMPTY_FORM} />
    </main>
  );
}
