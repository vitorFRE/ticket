import path from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

const root = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.join(root, "src"),
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    include: ["src/**/*.{spec,test}.{ts,tsx}"],
    exclude: ["e2e/**", "node_modules/**", ".next/**"],
    css: false,
    coverage: {
      provider: "v8",
      reportsDirectory: "./coverage",
    },
  },
});
