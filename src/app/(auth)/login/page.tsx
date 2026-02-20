import { Suspense } from "react";
import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-[var(--bg-canvas)] flex items-center justify-center p-4 sm:p-8">
      <Suspense
        fallback={
          <div className="surface-card w-full max-w-md p-8 text-center">
            <p className="text-sm text-[var(--text-muted)]">Loading secure login...</p>
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </main>
  );
}
