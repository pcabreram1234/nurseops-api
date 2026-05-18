import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    // Use env() for type-safe environment variable handling
    url: env("DATABASE_URL"),
  },
  migrations: {
    path: "./prisma/migrations",
    seed: "bun run ./prisma/seed.ts",
  },
});
