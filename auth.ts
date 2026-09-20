import NextAuth from "next-auth";
import Twitter from "next-auth/providers/twitter";

/// Shape of the X (Twitter) v2 /users/me response used below.
type XUser = {
  data: {
    id: string;
    name?: string;
    username?: string;
    email?: string;
    profile_image_url?: string;
  };
};

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: { strategy: "jwt" },
  providers: [
    Twitter({
      clientId: process.env.AUTH_TWITTER_ID,
      clientSecret: process.env.AUTH_TWITTER_SECRET,
      // The built-in profile drops the username, but we need it to match a
      // payment handle. Keep it (lowercased) and the X user id.
      profile(profile) {
        const data = (profile as unknown as XUser).data;
        return {
          id: data.id,
          name: data.name ?? data.username ?? data.id,
          email: data.email ?? null,
          image: data.profile_image_url,
          username: data.username?.toLowerCase() ?? null,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // `user` is only present on the initial sign-in and is our mapped
      // Twitter profile (see the provider `profile` override above).
      if (user) {
        const username = user.username;
        token.username = typeof username === "string" ? username.toLowerCase() : null;
        token.xUserId = typeof user.id === "string" ? user.id : null;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.username = typeof token.username === "string" ? token.username : null;
        session.user.xUserId = typeof token.xUserId === "string" ? token.xUserId : null;
      }
      return session;
    },
  },
});
