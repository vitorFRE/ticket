import { Suspense } from "react";
import { LoginPage } from "@/features/auth/components/login-page";

export default function LoginRoutePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[100dvh] items-center justify-center text-sm text-muted-foreground">
          Carregando...
        </div>
      }
    >
      <LoginPage />
    </Suspense>
  );
}
