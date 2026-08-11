import { RoleGate } from "@/features/auth/components/role-gate";

export default function OrganizerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RoleGate role="ORGANIZER">{children}</RoleGate>;
}
