import { existsSync, readFileSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { createInterface } from "node:readline"

const targetDir = process.cwd()

// Packages bundled with ts-builds (users don't need these)
const bundledPackages = [
  "@eslint/eslintrc",
  "@eslint/js",
  "@typescript-eslint/eslint-plugin",
  "@typescript-eslint/parser",
  "@vitest/coverage-v8",
  "@vitest/ui",
  "cross-env",
  "eslint",
  "eslint-config-prettier",
  "eslint-plugin-import",
  "eslint-plugin-prettier",
  "eslint-plugin-simple-import-sort",
  "prettier",
  "rimraf",
  "ts-node",
  "typescript",
  "vitest",
] as const

type BundledPackage = (typeof bundledPackages)[number]

interface PackageJson {
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
  [key: string]: unknown
}

const requiredHoistPatterns = [
  "public-hoist-pattern[]=*eslint*",
  "public-hoist-pattern[]=*prettier*",
  "public-hoist-pattern[]=*vitest*",
  "public-hoist-pattern[]=typescript",
  "public-hoist-pattern[]=*rimraf*",
  "public-hoist-pattern[]=*cross-env*",
]

function ensureNpmrcHoistPatterns(): void {
  const npmrcPath = join(targetDir, ".npmrc")
  const existingContent = existsSync(npmrcPath) ? readFileSync(npmrcPath, "utf-8") : ""

  const missingPatterns = requiredHoistPatterns.filter((pattern) => !existingContent.includes(pattern))

  if (missingPatterns.length === 0) {
    return
  }

  const header = "# Hoist CLI tool binaries from peer dependencies"
  const hasHeader = existingContent.includes(header)

  let newContent = existingContent
  if (!hasHeader && missingPatterns.length > 0) {
    const separator =
      existingContent.length > 0 && !existingContent.endsWith("\n") ? "\n\n" : existingContent.length > 0 ? "\n" : ""
    newContent = existingContent + separator + header + "\n"
  }

  for (const pattern of missingPatterns) {
    if (!newContent.endsWith("\n") && newContent.length > 0) {
      newContent += "\n"
    }
    newContent += pattern + "\n"
  }

  writeFileSync(npmrcPath, newContent)
  console.log(`✓ Updated .npmrc with ${missingPatterns.length} missing hoist pattern(s)`)
}

function showHelp(): void {
  console.log(`
ts-builds - Shared TypeScript configuration files

USAGE:
  npx ts-builds [command]

COMMANDS:
  init      Initialize project with config files (default)
  info      Show bundled packages you don't need to install
  cleanup   Remove redundant dependencies from package.json
  help      Show this help message

EXAMPLES:
  npx ts-builds          # Initialize project
  npx ts-builds info     # List bundled packages
  npx ts-builds cleanup  # Remove redundant deps

DESCRIPTION:
  This package bundles all ESLint, Prettier, Vitest, and TypeScript
  tooling as dependencies. You only need to install:

  - ts-builds (this package)
  - tsdown (peer dependency for building)

  Run 'npx ts-builds info' to see the full list
  of bundled packages.
`)
}

function showInfo(): void {
  console.log(`
ts-builds bundles these packages:

You DON'T need to install:
${bundledPackages.map((pkg) => `  - ${pkg}`).join("\n")}

You ONLY need to install:
  - ts-builds (this package)
  - tsdown (peer dependency, optional)

Example minimal package.json devDependencies:
{
  "devDependencies": {
    "ts-builds": "^3.0.0",
    "tsdown": "^0.12.0"
  }
}
`)
}

async function cleanup(): Promise<void> {
  const packageJsonPath = join(targetDir, "package.json")

  if (!existsSync(packageJsonPath)) {
    console.error("Error: No package.json found in current directory")
    process.exit(1)
  }

  const packageJson: PackageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"))
  const devDeps = packageJson.devDependencies || {}
  const deps = packageJson.dependencies || {}

  const redundantDev = bundledPackages.filter((pkg): pkg is BundledPackage => pkg in devDeps)
  const redundantDeps = bundledPackages.filter((pkg): pkg is BundledPackage => pkg in deps)

  if (redundantDev.length === 0 && redundantDeps.length === 0) {
    console.log("✓ No redundant packages found. Your package.json is clean!")
    return
  }

  console.log("\nFound redundant packages that are bundled with ts-builds:\n")

  if (redundantDev.length > 0) {
    console.log("devDependencies to remove:")
    redundantDev.forEach((pkg) => console.log(`  - ${pkg}`))
  }

  if (redundantDeps.length > 0) {
    console.log("\ndependencies to remove:")
    redundantDeps.forEach((pkg) => console.log(`  - ${pkg}`))
  }

  // Check for --yes flag
  const autoConfirm = process.argv.includes("--yes") || process.argv.includes("-y")

  if (!autoConfirm) {
    const rl = createInterface({
      input: process.stdin,
      output: process.stdout,
    })

    const answer = await new Promise<string>((resolve) => {
      rl.question("\nRemove these packages? (y/N) ", resolve)
    })
    rl.close()

    if (answer.toLowerCase() !== "y" && answer.toLowerCase() !== "yes") {
      console.log("Cancelled.")
      return
    }
  }

  // Remove redundant packages
  redundantDev.forEach((pkg) => delete devDeps[pkg])
  redundantDeps.forEach((pkg) => delete deps[pkg])

  // Update package.json
  if (Object.keys(devDeps).length > 0) {
    packageJson.devDependencies = devDeps
  } else {
    delete packageJson.devDependencies
  }

  if (Object.keys(deps).length > 0) {
    packageJson.dependencies = deps
  } else {
    delete packageJson.dependencies
  }

  writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + "\n")

  const totalRemoved = redundantDev.length + redundantDeps.length
  console.log(`\n✓ Removed ${totalRemoved} redundant package(s) from package.json`)
  console.log("\nRun 'pnpm install' to update your lockfile.")
}

function init(): void {
  console.log("Initializing ts-builds...")

  ensureNpmrcHoistPatterns()

  console.log("\nDone! Your project is configured to hoist CLI binaries from peer dependencies.")
  console.log("\nNext steps:")
  console.log("  - Run 'npx ts-builds info' to see bundled packages")
  console.log("  - Run 'npx ts-builds cleanup' to remove redundant deps")
}

// Parse command
const command = process.argv[2] || "init"

switch (command) {
  case "help":
  case "--help":
  case "-h":
    showHelp()
    break
  case "info":
  case "--info":
    showInfo()
    break
  case "cleanup":
  case "--cleanup":
    await cleanup()
    break
  case "init":
  default:
    init()
    break
}
