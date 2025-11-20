#!/usr/bin/env node

import { copyFileSync, existsSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const templateDir = join(__dirname, "..", "templates")
const targetDir = process.cwd()

const files = [".npmrc"]

console.log("Initializing typescript-template-configs...")

for (const file of files) {
  const src = join(templateDir, file)
  const dest = join(targetDir, file)

  if (existsSync(dest)) {
    console.log(`  ⚠ ${file} already exists, skipping`)
  } else {
    copyFileSync(src, dest)
    console.log(`  ✓ Created ${file}`)
  }
}

console.log("\nDone! Your project is configured to hoist CLI binaries from peer dependencies.")
