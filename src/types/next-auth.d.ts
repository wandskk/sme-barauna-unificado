import type { DefaultSession } from "next-auth";
import type { Role } from "@/core/auth/roles";

declare module "next-auth" {
  interface Session {
    user?: {
      id?: string;
      role?: Role;
      schoolId?: string | null;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: Role;
    schoolId?: string | null;
  }
}
