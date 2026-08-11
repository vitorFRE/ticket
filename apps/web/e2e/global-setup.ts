import { execSync } from "node:child_process";
import path from "node:path";

const repoRoot = path.resolve(process.cwd(), "../..");

export default function globalSetup() {
  execSync("pnpm --filter api prisma:seed", {
    cwd: repoRoot,
    stdio: "inherit",
  });
}
