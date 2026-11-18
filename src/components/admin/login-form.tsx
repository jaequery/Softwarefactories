"use client";

import { useActionState } from "react";
import { login, type LoginState } from "@/app/admin/session-actions";

export function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, {});
  return (
    <form action={action} className="flex flex-col gap-4" data-testid="login-form">
      <label className="flex flex-col gap-2">
        <span className="font-mono text-xs tracking-[0.08em] text-mute uppercase">password</span>
        <input
          type="password"
          name="password"
          required
          autoFocus
          autoComplete="current-password"
          data-testid="password-input"
          className="rounded-lg border border-line bg-bg px-3 py-2.5 text-text outline-none focus:border-neon/60"
        />
      </label>
      {state.error && (
        <p className="font-mono text-[13px] text-pink" role="alert" data-testid="login-error">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        data-testid="login-submit"
        className="rounded-lg bg-neon px-4 py-2.5 font-mono text-sm font-bold text-bg transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {pending ? "checking…" : "sign in →"}
      </button>
    </form>
  );
}
