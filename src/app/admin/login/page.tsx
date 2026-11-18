import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/login-form";
import { getAdminConfig, isAdmin } from "@/lib/admin/auth";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  if (await isAdmin()) redirect("/admin");
  const config = await getAdminConfig();

  return (
    <main className="mx-auto mt-10 max-w-[420px]" data-testid="admin-login">
      <p className="mb-3 font-mono text-[13px] text-neon">{"// admin"}</p>
      <h1 className="text-3xl font-bold tracking-[-0.03em]">Sign in</h1>
      <div className="mt-6 rounded-xl border border-line bg-panel p-6">
        {config.enabled ? (
          <LoginForm />
        ) : (
          <div data-testid="login-disabled" role="alert">
            <p className="font-semibold text-amber">Admin login is disabled.</p>
            <p className="mt-2 text-sm text-mute">{config.reason}</p>
            <p className="mt-3 text-sm text-mute">
              Set <code className="font-mono text-cyan">ADMIN_PASSWORD</code> and{" "}
              <code className="font-mono text-cyan">ADMIN_SESSION_SECRET</code> (in <code className="font-mono">.dev.vars</code>{" "}
              locally, or as secrets under Hosting → variables on Fredrin hosting), then reload.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
