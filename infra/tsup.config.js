import { defineConfig } from "tsup";

export default defineConfig([
   {
      entry: ["src/index.ts"],
      format: ["iife"],
      outDir: "dist",
      clean: false,
      minify: true,
      sourcemap: true,
      outExtension() {
         return {
            js: ".js", // This makes it output index.js instead of index.global.js
         };
      },
   },
   {
      entry: ["src/backend/server.ts"],
      format: ["esm"],
      outDir: "dist/backend",
      clean: false,
      minify: false,
      sourcemap: true,
      target: "node20",
      platform: "node",
      external: ["express", "cors", "openai", "dotenv"],
   },
]);
