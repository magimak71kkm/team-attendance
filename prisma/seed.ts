import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient } from "@prisma/client";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL required for seed");
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const passwordHash = await bcrypt.hash("admin123", 12);

  const team = await prisma.team.upsert({
    where: { id: "seed-team-engineering" },
    update: {},
    create: { id: "seed-team-engineering", name: "Engineering" },
  });

  await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      email: "admin@example.com",
      passwordHash,
      name: "관리자",
      role: "ADMIN",
      teamId: team.id,
    },
  });

  await prisma.user.upsert({
    where: { email: "kim@example.com" },
    update: {},
    create: {
      email: "kim@example.com",
      passwordHash: await bcrypt.hash("user123", 12),
      name: "김직원",
      role: "EMPLOYEE",
      teamId: team.id,
    },
  });

  const types = [
    { code: "ANNUAL", name: "연차" },
    { code: "SICK", name: "병가" },
    { code: "HALF_AM", name: "반차(오전)" },
    { code: "HALF_PM", name: "반차(오후)" },
  ];

  for (const t of types) {
    await prisma.leaveType.upsert({
      where: { code: t.code },
      update: { name: t.name },
      create: t,
    });
  }

  console.log("Seed OK: admin@example.com / admin123, kim@example.com / user123");
}

main()
  .then(() => prisma.$disconnect())
  .then(() => pool.end())
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
