import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient } from "@prisma/client";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function main() {
  console.log("DATABASE_URL host:", process.env.DATABASE_URL?.slice(0, 50));
  const users = await prisma.user.findMany({
    select: { email: true, passwordHash: true },
  });
  console.log("user count:", users.length);
  for (const u of users) {
    const a = await bcrypt.compare("admin123", u.passwordHash);
    const k = await bcrypt.compare("user123", u.passwordHash);
    console.log(u.email, "admin123:", a, "user123:", k);
  }
  await prisma.$disconnect();
  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
