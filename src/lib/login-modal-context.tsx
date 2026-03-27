"use client";

import { createContext, useContext, useState, useCallback } from "react";

type LoginModalContextType = {
  open: boolean;
  openLogin: () => void;
  closeLogin: () => void;
};

const LoginModalContext = createContext<LoginModalContextType>({
  open: false,
  openLogin: () => {},
  closeLogin: () => {},
});

export function LoginModalProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  const openLogin = useCallback(() => setOpen(true), []);
  const closeLogin = useCallback(() => setOpen(false), []);

  return (
    <LoginModalContext value={{ open, openLogin, closeLogin }}>
      {children}
    </LoginModalContext>
  );
}

export function useLoginModal() {
  return useContext(LoginModalContext);
}
