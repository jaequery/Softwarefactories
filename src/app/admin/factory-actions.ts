"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdminAction } from "@/lib/admin/auth";
import { deleteFactoryRecord, factoryExists, saveFactoryRecord, slugTaken } from "@/lib/admin/data";
import { readFactoryForm, validateFactory, type FactoryFormValues, type FieldErrors } from "@/lib/admin/schema";

export type FactoryFormState = { values?: FactoryFormValues; errors?: FieldErrors; message?: string; attempt?: number };

function parseId(raw: FormDataEntryValue | null): number | null {
  return typeof raw === "string" && /^[1-9]\d{0,9}$/.test(raw) ? Number(raw) : null;
}

/** Public pages read D1 per request; revalidating the whole tree also drops any client router cache. */
function revalidatePublic() {
  revalidatePath("/", "layout");
}

/** Create or update a factory and its review. Answers 401 without an admin session. */
export async function saveFactory(prev: FactoryFormState, formData: FormData): Promise<FactoryFormState> {
  await requireAdminAction();
  const attempt = (prev.attempt ?? 0) + 1;
  const id = parseId(formData.get("id"));
  if (formData.get("id") && id === null) return { message: "Invalid factory id.", attempt };
  const values = readFactoryForm(formData);

  const result = validateFactory(values);
  if (!result.ok) return { values, errors: result.errors, message: "Fix the highlighted fields.", attempt };
  if (id !== null && !(await factoryExists(id))) return { values, message: "This factory no longer exists.", attempt };
  if (await slugTaken(result.data.slug, id)) {
    return { values, errors: { slug: ["Another factory already uses this slug."] }, message: "Fix the highlighted fields.", attempt };
  }

  let savedId: number;
  try {
    savedId = await saveFactoryRecord(result.data, id);
  } catch (e) {
    if (String(e).includes("UNIQUE constraint failed: factories.slug")) {
      return { values, errors: { slug: ["Another factory already uses this slug."] }, message: "Fix the highlighted fields.", attempt };
    }
    throw e;
  }
  revalidatePublic();
  redirect(`/admin/factories/${savedId}?saved=1`);
}

/** Delete a factory and its review. Answers 401 without an admin session. */
export async function deleteFactory(formData: FormData): Promise<void> {
  await requireAdminAction();
  const id = parseId(formData.get("id"));
  if (id === null) redirect("/admin");
  const deleted = await deleteFactoryRecord(id);
  revalidatePublic();
  redirect(deleted ? "/admin?deleted=1" : "/admin");
}
