import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/server/auth";
import { AppShell } from "@/components/layout/AppShell";
import { Role } from "@/core/auth/roles";
import { prisma } from "@/server/db";

export default async function PainelLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const role = (session.user.role as Role) || "ESCOLA";
  let schoolName: string | undefined = undefined;

  if (session.user.schoolId) {
    const school = await prisma.school.findUnique({
      where: { id: session.user.schoolId },
      select: { name: true },
    }).catch(() => null);
    schoolName = school?.name;
  }

  return (
    <AppShell
      user={{
        name: session.user.name || "Usuário",
        email: session.user.email || "",
        role: role,
        schoolName: schoolName,
      }}
    >
      {children}
    </AppShell>
  );
}
