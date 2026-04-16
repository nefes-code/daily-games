"use client";

import { IconButton } from "@chakra-ui/react";
import { Sun, Moon } from "@solar-icons/react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  const isDark = resolvedTheme === "dark";

  return (
    <IconButton
      aria-label={isDark ? "Ativar modo claro" : "Ativar modo escuro"}
      size="xs"
      variant="ghost"
      color="fg.subtle"
      _hover={{ color: "brand.solid", bgColor: "brand.solid/10" }}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      title={isDark ? "Modo claro" : "Modo escuro"}
    >
      {isDark ? <Sun weight="BoldDuotone" /> : <Moon weight="BoldDuotone" />}
    </IconButton>
  );
}
