import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { pool } from "@/lib/db";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),

    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const { rows } = await pool.query(
          "SELECT * FROM users WHERE email = $1 AND auth_provider = 'local'",
          [credentials.email.toLowerCase().trim()]
        );

        const user = rows[0];
        if (!user || !user.password_hash) return null;

        const valid = await bcrypt.compare(credentials.password, user.password_hash);
        if (!valid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image || null,
        };
      },
    }),
  ],

  secret: process.env.NEXTAUTH_SECRET || "agile-edge-secret-2026",

  session: {
    strategy: "jwt",
  },

  pages: {
    signIn: "/auth",
    error: "/auth",
  },

  callbacks: {
    // Auto-create user record on first Google sign-in
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        try {
          const { rows } = await pool.query(
            "SELECT id FROM users WHERE email = $1",
            [user.email.toLowerCase()]
          );
          if (rows.length === 0) {
            await pool.query(
              "INSERT INTO users (name, email, auth_provider, image) VALUES ($1, $2, 'google', $3)",
              [user.name, user.email.toLowerCase(), user.image || null]
            );
          }
        } catch (err) {
          console.error("Error upserting Google user:", err);
        }
      }
      return true;
    },

    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
      }
      if (account) {
        token.accessToken = account.access_token;
        token.provider = account.provider;
      }
      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user = session.user || {};
        session.user.id = token.id;
        session.accessToken = token.accessToken;
        session.provider = token.provider;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
