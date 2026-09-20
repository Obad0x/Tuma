import type { DefaultSession } from "next-auth";

declare module "@auth/core/types" {
  interface Session {
    user: {
      /// Lowercased X (Twitter) username, without the leading "@".
      username?: string | null;
      /// X (Twitter) numeric user id.
      xUserId?: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    username?: string | null;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    username?: string | null;
    xUserId?: string | null;
  }
}
