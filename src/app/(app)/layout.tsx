import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AppShell } from "@/components/app-shell";

export default async function AppGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <AppShell
      name={session.user.name ?? session.user.email ?? ""}
      role={session.user.role}
    >
      {children}
    </AppShell>
  );
}
