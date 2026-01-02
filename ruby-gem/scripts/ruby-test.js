const path = require("path")
const {spawn} = require("child_process")

function readSpecArg() {
  const npmArgv = process.env.npm_config_argv
  if (npmArgv) {
    try {
      const parsed = JSON.parse(npmArgv)
      const original = Array.isArray(parsed.original) ? parsed.original : []
      const scriptIndex = original.indexOf("ruby-test")
      if (scriptIndex >= 0 && original[scriptIndex + 1]) {
        return original[scriptIndex + 1]
      }
    } catch (error) {
      // Fallback to process.argv below.
    }
  }

  const args = process.argv.slice(2)
  if (args[0] === "--") args.shift()
  return args[0]
}

const specArg = readSpecArg()
if (!specArg) {
  console.error("Usage: npm run ruby-test path/to/test_spec.rb")
  process.exit(1)
}

const repoRoot = path.resolve(__dirname, "..", "..")
const rubyDir = path.join(repoRoot, "ruby-gem")
const specPath = specArg.startsWith("ruby-gem/") ? specArg.slice("ruby-gem/".length) : specArg

const child = spawn("bundle", ["exec", "rspec", specPath], {
  cwd: rubyDir,
  stdio: "inherit"
})

child.on("exit", (code) => {
  process.exit(code ?? 1)
})
