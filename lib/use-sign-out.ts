"use client";

import { signOut } from "next-auth/react";
import { useDisconnect } from "wagmi";

/// Signs out of X *and* disconnects the wallet, so nothing stays connected.
export function useSignOutAndDisconnect() {
  const { disconnect } = useDisconnect();
  return async (callbackUrl = "/") => {
    disconnect();
    await signOut({ callbackUrl });
  };
}
