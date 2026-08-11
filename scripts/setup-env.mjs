import { copyFileSync, existsSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const force = process.argv.includes("--force");
const appsDir = join(root, "apps");

for (const name of readdirSync(appsDir)) {
  const example = join(appsDir, name, ".env.example");
  if (!existsSync(example)) continue;

  const target = join(appsDir, name, ".env");
  if (existsSync(target) && !force) {
    console.log(`skip: ${target} (already exists, use --force to overwrite)`);
    continue;
  }

  copyFileSync(example, target);
  console.log(`created: ${target}`);
}
