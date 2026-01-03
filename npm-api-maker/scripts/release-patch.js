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
  requireMaster = process.argv.includes("--require-master")

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

  requireMasterBranch() {
    const branch = this.runQuiet("git rev-parse --abbrev-ref HEAD", {cwd: this.repoRoot})
    if (branch !== "master") {
      console.error(`Release must run on master (current: ${branch}).`)
      process.exit(1)
    }
  }

  bumpPatch() {
    this.run("npm version patch --no-git-tag-version", {cwd: this.packageDir})
  }

  build() {
    this.run("npm run build", {cwd: this.packageDir})
  }

  readVersion() {
    const raw = fs.readFileSync(this.packageJsonPath, "utf8")
    return JSON.parse(raw).version
  }

  stageVersionFiles() {
    const candidates = [
      "npm-api-maker/package.json",
      "npm-api-maker/package-lock.json",
      "npm-api-maker/yarn.lock"
    ]

    const existing = candidates.filter((item) => fs.existsSync(path.join(this.repoRoot, item)))
    if (existing.length > 0) {
      this.run(`git add ${existing.join(" ")}`, {cwd: this.repoRoot})
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

  commit(version) {
    this.run(`git commit -m "Release npm-api-maker v${version}"`, {cwd: this.repoRoot})
  }

  push() {
    if (this.requireMaster) {
      this.run("git push origin master", {cwd: this.repoRoot})
      return
    }

    this.run("git push", {cwd: this.repoRoot})
  }

  publish() {
    this.run("npm publish", {cwd: this.packageDir})
  }

  execute() {
    this.requireCleanGit()
    if (this.requireMaster) {
      this.requireMasterBranch()
    }

    this.bumpPatch()
    this.build()
    this.stageVersionFiles()

    const version = this.readVersion()
    this.commit(version)
    this.push()

    this.ensureNpmLogin()
    this.publish()
  }
}

new ReleasePatch().execute()
