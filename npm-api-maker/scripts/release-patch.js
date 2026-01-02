import fs from "node:fs"
import path from "node:path"
import {execSync} from "node:child_process"
import {fileURLToPath} from "node:url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

class ReleasePatch {
  repoRoot = path.resolve(__dirname, "..", "..")
  packageDir = path.resolve(__dirname, "..")
  packageJsonPath = path.join(this.packageDir, "package.json")

  run(command, options = {}) {
    execSync(command, {stdio: "inherit", ...options})
  }

  runQuiet(command, options = {}) {
    return execSync(command, {encoding: "utf8", ...options}).trim()
  }

  requireCleanGit() {
    const status = this.runQuiet("git status --porcelain", {cwd: this.repoRoot})
    if (status) {
      console.error("Working tree is not clean. Commit or stash changes first.")
      process.exit(1)
    }
  }

  readVersion() {
    const raw = fs.readFileSync(this.packageJsonPath, "utf8")
    return JSON.parse(raw).version
  }

  stageReleaseFiles() {
    const standardCandidates = [
      "npm-api-maker/package.json",
      "npm-api-maker/package-lock.json",
      "npm-api-maker/yarn.lock"
    ]
    const forceCandidates = ["npm-api-maker/build"]

    const existingStandard = standardCandidates.filter((item) => fs.existsSync(path.join(this.repoRoot, item)))
    if (existingStandard.length > 0) {
      this.run(`git add ${existingStandard.join(" ")}`, {cwd: this.repoRoot})
    }

    const existingForce = forceCandidates.filter((item) => fs.existsSync(path.join(this.repoRoot, item)))
    if (existingForce.length > 0) {
      this.run(`git add -f ${existingForce.join(" ")}`, {cwd: this.repoRoot})
    }
  }

  ensureNpmLogin() {
    try {
      const whoami = this.runQuiet("npm whoami", {cwd: this.packageDir})
      if (whoami) return
    } catch (error) {
      // Fall through to login.
    }

    this.run("npm login", {cwd: this.packageDir})
  }

  execute() {
    this.requireCleanGit()
    this.ensureNpmLogin()

    this.run("npm version patch --no-git-tag-version", {cwd: this.packageDir})
    this.run("npm run build", {cwd: this.packageDir})

    this.stageReleaseFiles()

    const version = this.readVersion()
    this.run(`git commit -m "Release npm-api-maker v${version}"`, {cwd: this.repoRoot})
    this.run("git push", {cwd: this.repoRoot})
    this.run("npm publish", {cwd: this.packageDir})
  }
}

new ReleasePatch().execute()
