import { execSync } from "node:child_process"
import { join } from "node:path"
import { describe, expect, it } from "vitest"

const cliPath = join(__dirname, "..", "dist", "cli.js")

function runCli(args: string = ""): string {
  return execSync(`node ${cliPath} ${args}`, { encoding: "utf-8" })
}

describe("CLI", () => {
  it("should show help with help command", () => {
    const output = runCli("help")
    expect(output).toContain("typescript-template-configs")
    expect(output).toContain("USAGE:")
    expect(output).toContain("COMMANDS:")
    expect(output).toContain("init")
    expect(output).toContain("info")
    expect(output).toContain("cleanup")
  })

  it("should show help with --help flag", () => {
    const output = runCli("--help")
    expect(output).toContain("USAGE:")
  })

  it("should show info with info command", () => {
    const output = runCli("info")
    expect(output).toContain("You DON'T need to install:")
    expect(output).toContain("eslint")
    expect(output).toContain("prettier")
    expect(output).toContain("typescript")
    expect(output).toContain("vitest")
    expect(output).toContain("tsdown")
  })

  it("should run init by default", () => {
    const output = runCli("")
    expect(output).toContain("Initializing typescript-template-configs")
  })
})
