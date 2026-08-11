import { RoleGate } from "@/features/auth/components/role-gate";

export default function GateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RoleGate role="GATE">{children}</RoleGate>;
}
