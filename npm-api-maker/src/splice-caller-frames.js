// @ts-check

/**
 * Parses one stack frame line (e.g. `at t.reload (https://a.example/chunk.js:2:73779)`)
 * into a function name and source location. The position is stripped so the
 * same frame compares equal whether it was recorded synchronously or attached
 * by the engine as an `at async` frame.
 * @param {string} line
 * @returns {{name: string, key: string} | null}
 */
const parseStackFrame = (line) => {
  const match = line.match(/^\s*at (?:async )?(?:new )?(\S+) \(([^()]*)\)/)

  if (!match) return null

  const name = match[1]
  const parts = match[2].split(":")
  const location = parts.length >= 3 ? parts.slice(0, -2).join(":") : match[2]

  return {name, key: `${name}@${location}`}
}

/**
 * Appends the frames captured before the caller's first await to an error that
 * escaped that async region, so the report still shows who triggered the call.
 * Engines attach `at async` caller frames only best-effort; frames the stack
 * already carries are matched by function name and source (not position, which
 * differs between attached async frames and synchronous frames) and are not
 * repeated. The capture (`Error().stack`) must be taken synchronously at the
 * top of the method that is about to await, so its first frame is that method.
 * @param {unknown} error
 * @param {string} callerStack
 * @returns {void}
 */
const spliceCallerFrames = (error, callerStack) => {
  if (!(error instanceof Error) || !error.stack || !callerStack) return

  // V8 prefixes "Error\n" as a header; JSC/SpiderMonkey stacks start directly with a frame.
  const lines = callerStack.startsWith("Error")
    ? callerStack
      .split("\n")
      .slice(1)
    : callerStack.split("\n")

  // Some test environments insert an extra `at Error` frame at the capture
  // site; the capturing method's own frame is the one right below it.
  if ((/^\s*at Error \(/).test(lines[0] ?? "")) lines.shift()

  // The first remaining frame is the capturing method's own frame; the rest is the caller chain.
  const callerFrames = lines.slice(1)

  if (!callerFrames.length) return

  const presentFrames = /** @type {Set<string>} */ (new Set())
  for (const line of error.stack.split("\n")) {
    const frame = parseStackFrame(line)

    if (frame) presentFrames.add(frame.key)
  }

  const missingFrames = callerFrames.filter((line) => {
    const frame = parseStackFrame(line)

    return !frame || !presentFrames.has(frame.key)
  })

  if (!missingFrames.length) return

  error.stack = `${error.stack}\n${missingFrames.join("\n")}`
}

export default spliceCallerFrames
