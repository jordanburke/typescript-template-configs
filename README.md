# ts-builds

[![Validate Configs Package](https://github.com/jordanburke/ts-builds/actions/workflows/node.js.yml/badge.svg)](https://github.com/jordanburke/ts-builds/actions/workflows/node.js.yml)

Shared TypeScript configuration files for library templates. Provides standardized ESLint, Prettier, Vitest, TypeScript, and build configs.

## 📦 What's Included

This package provides base configuration files for TypeScript library templates:

### Locked Configs (Use As-Is)

- **`.prettierrc`** - Code formatting rules
- **`.prettierignore`** - Files to ignore from formatting

### Extendable Configs (Can Be Customized)

- **`eslint.config.base.mjs`** - Base ESLint rules + TypeScript support
- **`vitest.config.base.ts`** - Vitest test framework configuration
- **`tsconfig.base.json`** - TypeScript compiler base settings
- **`tsdown.config.base.ts`** - Build configuration for tsdown
- **`package-scripts.json`** - Standardized npm scripts reference

## 🚀 Installation

```bash
pnpm add -D ts-builds

# Also install peer dependency:
pnpm add -D tsdown
```

## 🛠️ CLI Commands

### Initialize Project

```bash
npx ts-builds
# or
npx ts-builds init
```

Creates `.npmrc` to configure pnpm to hoist CLI binaries from peer dependencies.

### Show Help

```bash
npx ts-builds help
```

### List Bundled Packages

```bash
npx ts-builds info
```

Shows all 19 packages bundled with this config (eslint, prettier, typescript, vitest, etc.) that you **don't need to install separately**.

### Remove Redundant Dependencies

```bash
npx ts-builds cleanup
# or auto-confirm with
npx ts-builds cleanup --yes
```

Scans your `package.json` and removes any devDependencies that are already bundled with `ts-builds`.

### Minimal Installation

Since this package bundles all tooling, you only need:

```json
{
  "devDependencies": {
    "ts-builds": "^1.0.0",
    "tsdown": "^0.12.0"
  }
}
```

**For local development** (testing before publishing):

```bash
# Build first, then test
pnpm build
node dist/cli.js help

# Or link globally
pnpm link --global
ts-builds help
```

## 📖 Usage

### Prettier (Locked - Use Exact Copy)

Copy the Prettier config to your project root:

```bash
cp node_modules/ts-builds/.prettierrc .
cp node_modules/ts-builds/.prettierignore .
```

Or reference it in your `package.json`:

```json
{
  "prettier": "ts-builds/prettier"
}
```

### ESLint (Extendable)

**Basic usage (inherit all base rules):**

```javascript
// eslint.config.mjs
import baseConfig from "ts-builds/eslint"

export default [...baseConfig]
```

**Extended usage (add variant-specific rules):**

```javascript
// eslint.config.mjs
import baseConfig from "ts-builds/eslint"

export default [
  ...baseConfig,
  {
    // React-specific rules
    files: ["**/*.tsx"],
    rules: {
      "react/jsx-uses-react": "error",
      "react-hooks/rules-of-hooks": "error",
    },
  },
]
```

### Vitest (Extendable)

**Basic usage:**

```typescript
// vitest.config.ts
import { defineConfig } from "vitest/config"
import baseConfig from "ts-builds/vitest"

export default defineConfig(baseConfig)
```

**Extended usage:**

```typescript
// vitest.config.ts
import { defineConfig } from "vitest/config"
import baseConfig from "ts-builds/vitest"

export default defineConfig({
  ...baseConfig,
  test: {
    ...baseConfig.test,
    setupFiles: ["./test/setup.ts"], // Add custom setup
  },
})
```

### TypeScript (Extendable)

**Basic usage:**

```json
{
  "extends": "ts-builds/tsconfig",
  "compilerOptions": {
    "outDir": "./dist"
  }
}
```

**Extended usage:**

```json
{
  "extends": "ts-builds/tsconfig",
  "compilerOptions": {
    "outDir": "./dist",
    "jsx": "react-jsx",
    "lib": ["ES2020", "DOM"]
  }
}
```

### Tsdown (Extendable)

**Basic usage:**

```typescript
// tsdown.config.ts
import baseConfig from "ts-builds/tsdown"

export default baseConfig
```

**Extended usage (customize entry points):**

```typescript
// tsdown.config.ts
import baseConfig from "ts-builds/tsdown"
import type { UserConfig } from "tsdown"

export default {
  ...baseConfig,
  entry: ["src/index.ts", "src/cli.ts"], // Multiple entry points
} satisfies UserConfig
```

### Package Scripts (Reference Only)

The `package-scripts.json` file contains standardized npm scripts. Copy the relevant scripts to your `package.json`:

```json
{
  "scripts": {
    "validate": "pnpm format && pnpm lint && pnpm test && pnpm build",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "lint": "eslint ./src --fix",
    "lint:check": "eslint ./src",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "test:ui": "vitest --ui",
    "build": "rimraf dist && cross-env NODE_ENV=production tsdown",
    "build:watch": "tsdown --watch",
    "dev": "tsdown --watch",
    "prepublishOnly": "pnpm validate",
    "ts-types": "tsc"
  }
}
```

## 🔄 Update Workflow

When configs are updated in this package, update your template:

```bash
# Update to latest version
pnpm update ts-builds

# Re-copy locked files (Prettier)
cp node_modules/ts-builds/.prettierrc .
cp node_modules/ts-builds/.prettierignore .

# Test that everything still works
pnpm validate
```

## 🎯 Design Philosophy

### Locked vs Extendable

**Locked files** ensure consistency across all templates:

- **Prettier** - Code formatting should be identical everywhere
- Prevents formatting debates and merge conflicts

**Extendable files** allow variant-specific customization:

- **ESLint** - Different variants need different rules (React, Node.js, etc.)
- **Vitest** - Some variants need custom test setup
- **TypeScript** - Browser vs Node targets, JSX support, etc.
- **Build configs** - Different entry points, output formats

### Semantic Versioning

This package follows semver:

- **Patch** (1.0.x) - Bug fixes in configs
- **Minor** (1.x.0) - New configs added, backward compatible
- **Major** (x.0.0) - Breaking changes to existing configs

## 📚 Available Template Variants

Templates using these configs:

- **[typescript-library-template](https://github.com/jordanburke/typescript-library-template)** - Base template (tsdown)
- **typescript-library-template-vite** - Vite-based variant (coming soon)
- **typescript-library-template-react** - React library variant (coming soon)

## 🤝 Contributing

Found a bug or want to improve the configs?

1. Fork this repository
2. Make your changes
3. Test in a template project
4. Submit a PR with explanation

## 📄 License

MIT © Jordan Burke

## 🔗 Related

- [STANDARDIZATION_GUIDE.md](./STANDARDIZATION_GUIDE.md) - How to apply this pattern
- [package-scripts.json](./package-scripts.json) - Script reference documentation
