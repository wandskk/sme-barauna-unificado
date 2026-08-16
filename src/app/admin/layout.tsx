import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/server/auth";
import { AppShell } from "@/components/layout/AppShell";
import { Role } from "@/core/auth/roles";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const role = (session.user.role as Role) || "SECRETARIA";

  return (
    <AppShell
      user={{
        name: session.user.name || "Usuário",
        email: session.user.email || "",
        role: role,
      }}
    >
      {children}
    </AppShell>
  );
}
