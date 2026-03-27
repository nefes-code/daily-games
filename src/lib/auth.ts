import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/lib/db";
import { users, accounts, sessions, verificationTokens } from "@/lib/schema";

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  providers: [Google],
  pages: {
    // Não temos página de login — usamos modal.
    // Redireciona para home em caso de erro.
    error: "/",
  },
  callbacks: {
    session({ session, user }) {
      // Expõe id e image na session do client
      session.user.id = user.id;
      return session;
    },
  },
});
