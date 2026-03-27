"use client";

import { signIn } from "next-auth/react";
import { useEffect } from "react";

export default function SignInPage() {
  useEffect(() => {
    signIn("google", { callbackUrl: "/auth/popup-close" });
  }, []);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        fontFamily: "system-ui",
        color: "#666",
      }}
    >
      Redirecionando para o Google...
    </div>
  );
}
