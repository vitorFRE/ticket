import baseConfig from "@teste-ticket/config/jest";
import type { Config } from "jest";

const config: Config = {
  ...baseConfig,
  moduleNameMapper: {
    ...baseConfig.moduleNameMapper,
    // Prisma 7 generated client imports .js paths that map to .ts sources
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
};

export default config;
