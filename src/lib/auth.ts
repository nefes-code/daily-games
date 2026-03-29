import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { eq } from "drizzle-orm";

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  providers: [Google],
  session: { strategy: "jwt" },
  pages: {
    error: "/",
  },
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false;

      const existing = await db
        .select()
        .from(users)
        .where(eq(users.email, user.email))
        .limit(1)
        .then((r) => r[0] ?? null);

      if (!existing) {
        await db.insert(users).values({
          email: user.email,
          name: user.name ?? null,
          image: user.image ?? null,
        });
      } else {
        await db
          .update(users)
          .set({
            name: user.name ?? existing.name,
            image: user.image ?? existing.image,
          })
          .where(eq(users.email, user.email));
      }

      return true;
    },

    async jwt({ token, user }) {
      if (user?.email) {
        const dbUser = await db
          .select()
          .from(users)
          .where(eq(users.email, user.email))
          .limit(1)
          .then((r) => r[0] ?? null);
        if (dbUser) token.userId = dbUser.id;
      }
      return token;
    },

    session({ session, token }) {
      if (token.userId) session.user.id = token.userId as string;
      return session;
    },
  },
});
