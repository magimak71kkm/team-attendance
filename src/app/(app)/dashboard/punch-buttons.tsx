"use client";

import { useState } from "react";
import { punchInAction, punchOutAction } from "./actions";

export function PunchButtons({
  canCheckIn,
  canCheckOut,
}: {
  canCheckIn: boolean;
  canCheckOut: boolean;
}) {
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState<"in" | "out" | null>(null);

  async function run(
    fn: () => Promise<{ ok: boolean; message: string }>,
    key: "in" | "out",
  ) {
    setMsg(null);
    setErr(null);
    setLoading(key);
    const r = await fn();
    setLoading(null);
    if (r.ok) {
      setMsg(r.message);
    } else {
      setErr(r.message);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          disabled={!canCheckIn || loading !== null}
          onClick={() => run(punchInAction, "in")}
          className="min-w-[7rem] rounded-md bg-[var(--accent)] px-4 py-3 text-sm font-medium text-[var(--accent-contrast)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {loading === "in" ? "처리 중…" : "출근"}
        </button>
        <button
          type="button"
          disabled={!canCheckOut || loading !== null}
          onClick={() => run(punchOutAction, "out")}
          className="min-w-[7rem] rounded-md border border-[var(--border)] bg-transparent px-4 py-3 text-sm font-medium text-[var(--text)] transition hover:border-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {loading === "out" ? "처리 중…" : "퇴근"}
        </button>
      </div>
      {msg && (
        <p className="text-sm text-[var(--success)]" role="status">
          {msg}
        </p>
      )}
      {err && (
        <p className="text-sm text-[var(--danger)]" role="alert">
          {err}
        </p>
      )}
    </div>
  );
}
