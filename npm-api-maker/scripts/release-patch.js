import fs from "node:fs"
import path from "node:path"
import {execSync} from "node:child_process"
import {fileURLToPath} from "node:url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const repoRoot = path.resolve(__dirname, "..", "..")
const packageDir = path.resolve(__dirname, "..")
const packageJsonPath = path.join(packageDir, "package.json")

function run(command, options = {}) {
  execSync(command, {stdio: "inherit", ...options})
}

function runQuiet(command, options = {}) {
  return execSync(command, {encoding: "utf8", ...options}).trim()
}

function requireCleanGit() {
  const status = runQuiet("git status --porcelain", {cwd: repoRoot})
  if (status) {
    console.error("Working tree is not clean. Commit or stash changes first.")
    process.exit(1)
  }
}

function readVersion() {
  const raw = fs.readFileSync(packageJsonPath, "utf8")
  return JSON.parse(raw).version
}

function stageReleaseFiles() {
  const candidates = [
    "npm-api-maker/package.json",
    "npm-api-maker/package-lock.json",
    "npm-api-maker/yarn.lock",
    "npm-api-maker/build"
  ]

  const existing = candidates.filter((item) => fs.existsSync(path.join(repoRoot, item)))
  if (existing.length > 0) {
    run(`git add ${existing.join(" ")}`, {cwd: repoRoot})
  }
}

requireCleanGit()

run("npm version patch --no-git-tag-version", {cwd: packageDir})
run("npm run build", {cwd: packageDir})

stageReleaseFiles()

const version = readVersion()
run(`git commit -m "Release npm-api-maker v${version}"`, {cwd: repoRoot})
run("git push", {cwd: repoRoot})
run("npm publish", {cwd: packageDir})
