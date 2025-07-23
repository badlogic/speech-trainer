#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Read env.vars file
const envVarsFile = path.join(__dirname, "..", "env.vars");
if (!fs.existsSync(envVarsFile)) {
   console.error("env.vars file not found");
   process.exit(1);
}

const envVars = fs
   .readFileSync(envVarsFile, "utf8")
   .split("\n")
   .map((line) => line.trim())
   .filter((line) => line && !line.startsWith("#"));

// Generate .env content
const envContent = envVars
   .map((varName) => {
      const value = process.env[varName];
      if (!value) {
         console.warn(`Warning: ${varName} not found in environment`);
         return null;
      }
      return `${varName}=${value}`;
   })
   .filter(Boolean)
   .join("\n");

// Output to stdout
console.log(envContent);
