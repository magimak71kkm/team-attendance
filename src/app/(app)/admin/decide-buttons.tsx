"use client";

import { useState } from "react";
import { decideLeaveAction } from "../leave/actions";

export function DecideLeaveButtons({ leaveId }: { leaveId: string }) {
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState<"a" | "r" | null>(null);

  async function go(d: "APPROVED" | "REJECTED") {
    setMsg(null);
    setLoading(d === "APPROVED" ? "a" : "r");
    const r = await decideLeaveAction(leaveId, d);
    setLoading(null);
    setMsg(r.message);
    if (r.ok) {
      window.location.reload();
    }
  }

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      <button
        type="button"
        disabled={loading !== null}
        onClick={() => go("APPROVED")}
        className="rounded border border-[var(--success)] px-3 py-1 text-xs text-[var(--success)] hover:bg-[var(--surface)] disabled:opacity-50"
      >
        {loading === "a" ? "…" : "승인"}
      </button>
      <button
        type="button"
        disabled={loading !== null}
        onClick={() => go("REJECTED")}
        className="rounded border border-[var(--danger)] px-3 py-1 text-xs text-[var(--danger)] hover:bg-[var(--surface)] disabled:opacity-50"
      >
        {loading === "r" ? "…" : "반려"}
      </button>
      {msg && <span className="text-xs text-[var(--muted)]">{msg}</span>}
    </div>
  );
}
