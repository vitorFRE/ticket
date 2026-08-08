import { defineConfig } from "tsup";

export default defineConfig({
  dts: true,
  clean: true,
  format: ["cjs", "esm"],
  treeshake: "recommended",
  entry: ["base/*.{ts,js}"],
  onSuccess: "node scripts/copy-json.mjs",
});
