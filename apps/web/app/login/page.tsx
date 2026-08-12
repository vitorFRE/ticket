import { Suspense } from "react";
import { LoginSuspenseFallback } from "@/components/skeletons/login-suspense-fallback";
import { LoginPage } from "@/features/auth/components/login-page";

export default function LoginRoutePage() {
  return (
    <Suspense fallback={<LoginSuspenseFallback />}>
      <LoginPage />
    </Suspense>
  );
}
