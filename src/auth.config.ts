import type { NextAuthConfig } from "next-auth";

// Lightweight auth config used ONLY in middleware
// No Prisma, no bcrypt, no googleapis — keeps middleware bundle < 1MB
export default {
  providers: [], // providers defined in full auth.ts
  pages: {
    signIn: "/login",
    error: "/login",
  },
} satisfies NextAuthConfig;
