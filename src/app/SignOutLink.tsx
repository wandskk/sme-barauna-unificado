"use client";

import { signOut } from "next-auth/react";

export function SignOutLink() {
  return (
    <button onClick={() => signOut({ callbackUrl: "/login" })} className="hover:underline">
      Sair
    </button>
  );
}
