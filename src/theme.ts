"use client";

import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react";

const config = defineConfig({
  globalCss: {
    "html, body": {
      bg: "gray.50",
      color: "gray.800",
      fontFamily: "system-ui, sans-serif",
    },
  },
  theme: {
    semanticTokens: {
      colors: {
        brand: {
          solid: { value: "#58CC02" },
          contrast: { value: "#FFFFFF" },
          fg: { value: "#58CC02" },
          muted: { value: "#89E219" },
          subtle: { value: "#E5F8D0" },
          emphasized: { value: "#4CAD00" },
        },
      },
    },
  },
});

export const system = createSystem(defaultConfig, config);
