import Link from "next/link";
import { prisma } from "@/lib/db";
import { NewLeaveForm } from "./new-leave-form";

export default async function NewLeavePage() {
  const types = await prisma.leaveType.findMany({ orderBy: { code: "asc" } });

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <Link
          href="/leave"
          className="text-sm text-[var(--muted)] hover:text-[var(--accent)]"
        >
          ← 목록
        </Link>
        <h1 className="mt-2 text-xl font-semibold">휴가 신청</h1>
      </div>
      <NewLeaveForm types={types} />
    </div>
  );
}
