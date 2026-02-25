# AGENTS

Notes:
- Use React Native elements only; do not replace them with DOM elements in specs or dummy app code.
- Prefer React Native components for all new code, including spec/dummy pages.
- Do not edit `build/` outputs manually; regenerate with the appropriate build command instead.
- Only run builds when releasing a new package; development runs against source files.
- When using `gh pr create/edit`, pass multi-line bodies with real newlines (not literal `\n`) so GitHub renders them correctly.
- Avoid unrelated changes (for example, adding placeholder modules in specs) unless they are necessary for the requested change.
- Before committing, review the current diff and propose commit message(s) grouped by logical change sets.
- Prefer `describe` over `RSpec.describe` in specs.
- Do not add `# frozen_string_literal: true` to files.
- Prefer multiple small, individually working commits when possible.
- Always run Rubocop on changed Ruby files.
- Always run ESLint on changed or new JavaScript files.
- ESLint `sort-imports` orders import lines by member syntax group (none/all/multiple/single) and then the first local specifier name, not by module specifier; adjust import order accordingly.
- When creating PRs, choose a sensible branch name and commit messages without prompting.
- For system specs, use `ruby-gem/scripts/run-system-spec.sh [spec/path.rb:line]` (wraps the README system spec command).
- When installing gems, run `bundle install` in both `ruby-gem/` and `ruby-gem/spec/dummy/` before running specs.
- If `ruby-gem/scripts/run-system-spec.sh` fails, run the README system spec command manually from `ruby-gem/`.
- Do not “fix” flaky specs by only increasing waits/timeouts. First determine whether behavior regressed (for example, element never rendered) and collect/inspect CI artifacts before adjusting timing.
- Avoid unnecessary defensive conditions for guaranteed contracts. Prefer failing fast over silently accepting impossible states.
- In JavaScript class method definitions, use `methodName(args)` (no space before parentheses).
- Keep component props ordered alphabetically.
- To typecheck a single file, run `npm run typecheck:file --file=src/path/to/file.js` from `npm-api-maker/` (you can also pass `npm-api-maker/src/...` or set `FILE=src/path/to/file.js`).
