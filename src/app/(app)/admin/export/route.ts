import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

function csvEscape(s: string) {
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const fromStr = searchParams.get("from");
  const toStr = searchParams.get("to");
  const teamId = searchParams.get("teamId");

  if (!fromStr || !toStr) {
    return new NextResponse("from, to required (YYYY-MM-DD)", { status: 400 });
  }

  const from = new Date(`${fromStr}T00:00:00+09:00`);
  const to = new Date(`${toStr}T23:59:59.999+09:00`);

  const userFilter =
    teamId && teamId !== "all" ? { teamId } : {};

  const [records, leaves] = await Promise.all([
    prisma.attendanceRecord.findMany({
      where: {
        at: { gte: from, lte: to },
        user: userFilter,
      },
      include: { user: { include: { team: true } } },
      orderBy: { at: "asc" },
    }),
    prisma.leaveRequest.findMany({
      where: {
        startDate: { lte: to },
        endDate: { gte: from },
        user: userFilter,
      },
      include: { user: { include: { team: true } }, type: true },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  const lines: string[] = [];
  lines.push("\uFEFFsection,type,user,email,team,detail,at_or_range,status");
  for (const r of records) {
    lines.push(
      [
        "attendance",
        r.kind,
        csvEscape(r.user.name),
        csvEscape(r.user.email),
        csvEscape(r.user.team?.name ?? ""),
        "",
        r.at.toISOString(),
        "",
      ].join(","),
    );
  }
  for (const l of leaves) {
    lines.push(
      [
        "leave",
        csvEscape(l.type.name),
        csvEscape(l.user.name),
        csvEscape(l.user.email),
        csvEscape(l.user.team?.name ?? ""),
        l.halfDay ?? "",
        `${l.startDate.toISOString()}_${l.endDate.toISOString()}`,
        l.status,
      ].join(","),
    );
  }

  const body = lines.join("\r\n");
  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="export_${fromStr}_${toStr}.csv"`,
    },
  });
}
