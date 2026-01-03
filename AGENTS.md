# AGENTS

Notes:
- Use React Native elements only; do not replace them with DOM elements in specs or dummy app code.
- Do not edit `build/` outputs manually; regenerate with the appropriate build command instead.
- Only run builds when releasing a new package; development runs against source files.
- When using `gh pr create/edit`, pass multi-line bodies with real newlines (not literal `\n`) so GitHub renders them correctly.
- Avoid unrelated changes (for example, adding placeholder modules in specs) unless they are necessary for the requested change.
- Before committing, review the current diff and propose commit message(s) grouped by logical change sets.
- Prefer `describe` over `RSpec.describe` in specs.
- Do not add `# frozen_string_literal: true` to files.
- Prefer multiple small, individually working commits when possible.
- Always run Rubocop on changed Ruby files.
- When creating PRs, choose a sensible branch name and commit messages without prompting.
- For system specs, use `scripts/run-system-spec.sh [spec/path.rb:line]` (wraps the README system spec command).
