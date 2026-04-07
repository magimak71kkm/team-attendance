import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen flex-col justify-center px-4">
      <div className="mx-auto w-full max-w-sm rounded-lg border border-[var(--border)] bg-[var(--surface-raised)] p-8 shadow-sm">
        <h1 className="text-lg font-semibold text-[var(--text)]">로그인</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          이메일과 비밀번호를 입력하세요.
        </p>
        <LoginForm />
      </div>
    </div>
  );
}
