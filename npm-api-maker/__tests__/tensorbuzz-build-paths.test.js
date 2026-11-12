import {readFileSync} from "node:fs"
import yaml from "js-yaml"

const configUrl = new URL("../../tensorbuzz.yml", import.meta.url)
const config = yaml.load(readFileSync(configUrl, "utf8"))
const parentBuild = config.builds.setup
const childBuilds = parentBuild.builds

/**
 * Models the `paths` grammar the patterns in tensorbuzz.yml actually use: a `dir/**` entry is
 * anchored at the repository root and covers everything below it. Any other glob form is
 * rejected so this guard cannot silently match something the product's matcher would treat
 * differently.
 *
 * @param {string} pattern One `paths` entry as written in tensorbuzz.yml, `!` prefix included.
 * @param {string} path Repository-relative changed path.
 * @returns {boolean} True when the pattern body covers the path, ignoring the `!` prefix.
 */
const patternBodyCoversPath = (pattern, path) => {
  const body = pattern.startsWith("!") ? pattern.slice(1) : pattern

  if (!body.endsWith("/**")) {
    throw new Error(`Unsupported path pattern in tensorbuzz.yml: ${pattern}`)
  }

  const directory = body.slice(0, -3)

  return path == directory || path.startsWith(`${directory}/`)
}

/**
 * Last matching rule wins, exactly like the product's path filter: a later `!` entry carves a
 * subtree out of an earlier positive one.
 *
 * @param {Record<string, any>} build A build entry from tensorbuzz.yml.
 * @param {string} changedPath Repository-relative changed path.
 * @returns {boolean} True when the build's `paths` keep it in for that change.
 */
const buildRunsForPath = (build, changedPath) => {
  let runs = false

  for (const pattern of build.paths) {
    if (patternBodyCoversPath(pattern, changedPath)) runs = !pattern.startsWith("!")
  }

  return runs
}

/**
 * @param {Record<string, any>} build A build entry from tensorbuzz.yml.
 * @returns {string[]} Every problem with that build's `paths`, named for the build.
 */
const pathFilterProblemsForBuild = (build) => {
  const problems = []

  if (!Array.isArray(build.paths)) return [`${build.name}: paths is not an array`]
  if (build.paths.length < 1) return [`${build.name}: paths is empty`]

  for (const pattern of build.paths) {
    const body = pattern.startsWith("!") ? pattern.slice(1) : pattern

    if (typeof pattern != "string" || body.trim().length < 1) problems.push(`${build.name}: empty path pattern`)
    else if (body.startsWith("/")) problems.push(`${build.name}: path pattern is not repo-relative: ${pattern}`)
  }

  return problems
}

/**
 * @param {Record<string, any>} build A build entry from tensorbuzz.yml.
 * @returns {string[]} Every `!` entry that carves out a tree no positive rule of this build covers.
 */
const uncoveredNegationsForBuild = (build) => {
  const positivePatterns = build.paths.filter((pattern) => !pattern.startsWith("!"))

  return build.paths
    .filter((pattern) => pattern.startsWith("!"))
    .filter((pattern) => !positivePatterns.some((positive) => patternBodyCoversPath(positive, `${pattern.slice(1, -3)}/probe`)))
    .map((pattern) => `${build.name}: ${pattern}`)
}

/**
 * @param {Record<string, any>} build A build entry from tensorbuzz.yml.
 * @returns {string[]} Every directory this build cds into that its own `paths` would not trigger it for.
 */
const uncoveredWorkingDirectoriesForBuild = (build) => {
  const problems = []

  for (const command of build.script) {
    for (const match of command.matchAll(/(?:^|&&)\s*cd\s+([^\s&]+)/g)) {
      const workingDirectory = match[1]

      if (!buildRunsForPath(build, `${workingDirectory}/probe`)) {
        problems.push(`${build.name}: ${workingDirectory} is not covered by its paths`)
      }
    }
  }

  return problems
}

describe("TensorBuzz build path filters", () => {
  it("keeps the chained parent free of a path filter", () => {
    // TensorBuzz validates every extracted build config standalone, where the parent reads as a
    // root config: a parent declaring both `paths` and `builds` is rejected there, errors in
    // about a second and leaves every child `new` / `parent_not_succeeded` with no verdict.
    expect(parentBuild.paths).toBeUndefined()
    expect(Object.keys(childBuilds).length).toBeGreaterThan(0)
  })

  it("gives every child build a usable path filter", () => {
    const problems = Object.values(childBuilds)
      .flatMap((build) => pathFilterProblemsForBuild(build))

    expect(problems).toEqual([])
  })

  it("never lets a negation carve away a tree no positive rule covers", () => {
    const problems = Object.values(childBuilds)
      .flatMap((build) => uncoveredNegationsForBuild(build))

    expect(problems).toEqual([])
  })

  it("runs every build whose script changes its own working directory", () => {
    const problems = Object.values(childBuilds)
      .flatMap((build) => uncoveredWorkingDirectoriesForBuild(build))

    expect(problems).toEqual([])
  })

  it("skips the lanes that cannot be affected by a path-local change", () => {
    const browserLanes = [
      "Chrome Rails 6 Ruby 3.3.5",
      "Firefox Rails 6 Ruby 3.3.5",
      "Chrome Rails 7 Ruby 3.3.5",
      "Firefox Rails 7 Ruby 3.3.5"
    ]
    const expectations = [
      {
        changedPath: "npm-api-maker/src/table/index.jsx",
        running: [...browserLanes, "Jest", "ESLint", "Expo Doctor", "Typecheck"]
      },
      {
        changedPath: "ruby-gem/lib/api_maker/model.rb",
        running: ["RSpec Rails 6 Ruby 3.3.5", "RSpec Rails 7 Ruby 3.3.5", ...browserLanes, "Rubocop", "Rails Best Practices"]
      },
      {
        changedPath: "api_maker_table_rubygem/lib/api_maker_table.rb",
        running: ["RSpec Rails 6 Ruby 3.3.5", "RSpec Rails 7 Ruby 3.3.5", ...browserLanes]
      },
      {changedPath: "npm-api-maker/example/App.tsx", running: ["Jest", "ESLint", "Expo Doctor", "Typecheck"]},
      {changedPath: "npm-api-maker/changelog.d/20261109-example.md", running: ["Jest", "ESLint", "Expo Doctor", "Typecheck"]},
      {changedPath: "README.md", running: []}
    ]

    for (const expectation of expectations) {
      const running = Object.values(childBuilds)
        .filter((build) => buildRunsForPath(build, expectation.changedPath))
        .map((build) => build.name)

      expect({changedPath: expectation.changedPath, running}).toEqual({changedPath: expectation.changedPath, running: expectation.running})
    }
  })
})
