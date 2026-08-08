import { copyFileSync, mkdirSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const base = join(root, "base");
const dist = join(root, "dist");

mkdirSync(dist, { recursive: true });

for (const file of readdirSync(base)) {
  if (file.endsWith(".json")) {
    copyFileSync(join(base, file), join(dist, file));
  }
}
