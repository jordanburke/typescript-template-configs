import type { Options } from "tsup"

export const tsup: Options = {
  entry: ["src/**/*.ts"],
  format: ["esm"],
  dts: false, // Config files don't need type declarations
  clean: true,
  outDir: "dist",
  splitting: false,
  sourcemap: false,
  minify: false,
  bundle: false,
  skipNodeModulesBundle: true,
  target: "es2020",
  outExtension: () => ({ js: ".js" }),
}
