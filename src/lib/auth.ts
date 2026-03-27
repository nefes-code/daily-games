import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  adapter: PrismaAdapter(prisma),
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
