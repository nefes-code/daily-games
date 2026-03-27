"use client";

import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react";

const config = defineConfig({
  globalCss: {
    "html, body": {
      bg: "gray.50",
      color: "gray.800",
      fontFamily: "var(--font-roboto), system-ui, sans-serif",
    },
  },
  theme: {
    semanticTokens: {
      colors: {
        brand: {
          solid: { value: "#F5A605" },
          contrast: { value: "#FFFFFF" },
          fg: { value: "#92400E" },
          muted: { value: "#FBBF24" },
          subtle: { value: "#FEF3C7" },
          emphasized: { value: "#D97706" },
        },
      },
    },
  },
});

export const system = createSystem(defaultConfig, config);
