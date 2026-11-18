import Link from "next/link";
import { logout } from "@/app/admin/session-actions";

/** Admin page header: breadcrumb title, links and the sign-out button. */
export function AdminBar({ title, back }: { title: string; back?: boolean }) {
  return (
    <header className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-line pb-6">
      <div>
        <p className="mb-2 font-mono text-[13px] text-neon">
          {back ? (
            <Link href="/admin" className="hover:underline">
              {"← // admin"}
            </Link>
          ) : (
            "// admin"
          )}
        </p>
        <h1 className="text-3xl font-bold tracking-[-0.03em] sm:text-4xl">{title}</h1>
      </div>
      <form action={logout}>
        <button
          type="submit"
          data-testid="logout"
          className="rounded-lg border border-line px-3 py-2 font-mono text-[13px] text-mute transition-colors hover:border-pink/60 hover:text-pink"
        >
          sign out
        </button>
      </form>
    </header>
  );
}
