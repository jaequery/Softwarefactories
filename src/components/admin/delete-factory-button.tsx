"use client";

import { deleteFactory } from "@/app/admin/factory-actions";

export function DeleteFactoryButton({ id, name }: { id: number; name: string }) {
  return (
    <form
      action={deleteFactory}
      onSubmit={(e) => {
        if (!window.confirm(`Delete "${name}" and its review? This cannot be undone.`)) e.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        data-testid="delete-factory"
        className="rounded-lg border border-pink/50 px-4 py-2 font-mono text-sm text-pink transition-colors hover:bg-pink/10"
      >
        delete factory
      </button>
    </form>
  );
}
