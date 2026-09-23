// @ts-check
/* eslint-disable func-style, jest/max-expects, jest/require-top-level-describe, no-confusing-arrow, react/jsx-filename-extension, react/jsx-no-bind */
import React, {act} from "react"
import {createRoot} from "react-dom/client"
import {jest} from "@jest/globals"

jest.unstable_mockModule("prop-types-exact", () => ({default: (propTypes) => propTypes}))
jest.unstable_mockModule("i18n-on-steroids/build/src/use-i18n.js", () => ({
  default: () => ({t: (key) => key})
}))

let InputsCheckbox
let BootstrapCheckbox
let events
let ValidationErrors

global.IS_REACT_ACT_ENVIRONMENT = true

const mountedRoots = []

beforeAll(async() => {
  InputsCheckbox = (await import("../src/inputs/checkbox.jsx")).default
  BootstrapCheckbox = (await import("../src/bootstrap/checkbox.jsx")).default
  events = (await import("../src/events.js")).default
  ValidationErrors = (await import("../src/validation-errors.js")).ValidationErrors
})

function render(element) {
  const container = document.createElement("div")
  const root = createRoot(container)

  document.body.appendChild(container)
  act(() => root.render(element))
  mountedRoots.push({container, root})

  return {container}
}

/** Builds one backend validation-error entry, overriding the given fields. */
function entry(overrides = {}) {
  return {
    attribute_name: "email",
    attribute_type: "attribute",
    error_messages: ["is invalid"],
    error_types: [],
    input_name: "user[email]",
    model_name: "User",
    ...overrides
  }
}

/**
 * Emits a validation-error event and flushes the deferred re-render. The
 * set-state-compare shape defers state-driven renders through a setTimeout(0)
 * after-paint queue, so the emit must be awaited with a macrotask yield.
 */
async function emitValidationErrors(entries) {
  await act(async() => {
    events.emit("onValidationErrors", new ValidationErrors({model: null, validationErrors: entries}))
    await new Promise((resolve) => {
      setTimeout(resolve, 0)
    })
  })
}

/** onErrors also fires on mount with an empty array; only matched calls carry errors. */
function matchedCalls(onErrors) {
  return onErrors.mock.calls.filter((call) => call[0].length > 0)
}

function matchedInputNames(onErrors) {
  return matchedCalls(onErrors).map((call) => call[0].map((error) => error.inputName))
}

afterEach(() => {
  while (mountedRoots.length > 0) {
    const mounted = mountedRoots.pop()

    act(() => mounted.root.unmount())
    mounted.container.remove()
  }

  jest.restoreAllMocks()
})

describe("useInput validation-error matching", () => {
  it("delivers only the errors whose input name matches by default", async() => {
    const onErrors = jest.fn()

    render(<InputsCheckbox name="user[email]" onErrors={onErrors} zeroInput={false} />)
    await emitValidationErrors([
      entry({input_name: "user[email]"}),
      entry({attribute_name: "name", input_name: "user[name]"})
    ])

    expect(matchedCalls(onErrors)).toHaveLength(1)
    expect(matchedInputNames(onErrors)).toEqual([["user[email]"]])
  })

  it("lets onMatchValidationError match errors the default name rule would miss", async() => {
    const onErrors = jest.fn()

    // Nested-attributes form: the field is user[profile][bio] but the server
    // reports the error on the parent association user[profile].
    render(
      <InputsCheckbox
        name="user[profile][bio]"
        onErrors={onErrors}
        onMatchValidationError={(validationError) => validationError.inputName == "user[profile]"}
        zeroInput={false}
      />
    )
    await emitValidationErrors([entry({attribute_name: "profile", input_name: "user[profile]"})])

    expect(matchedCalls(onErrors)).toHaveLength(1)
    expect(matchedInputNames(onErrors)).toEqual([["user[profile]"]])
  })

  it("lets onMatchValidationError reject errors the default name rule would match", async() => {
    const onErrors = jest.fn()

    render(
      <InputsCheckbox
        name="user[email]"
        onErrors={onErrors}
        onMatchValidationError={() => false}
        zeroInput={false}
      />
    )
    await emitValidationErrors([entry({input_name: "user[email]"})])

    expect(onErrors).toHaveBeenCalled()
    expect(matchedCalls(onErrors)).toHaveLength(0)
  })
})

describe("Bootstrap Checkbox validation callbacks", () => {
  it("delivers the matched error exactly once despite two useInput instances", async() => {
    const onErrors = jest.fn()

    render(<BootstrapCheckbox name="user[enabled]" onErrors={onErrors} />)
    await emitValidationErrors([entry({attribute_name: "enabled", input_name: "user[enabled]"})])

    // The wrapper and the inner input each run useInput; the callback must fire
    // once, owned by the wrapper, not once per hook instance.
    expect(matchedCalls(onErrors)).toHaveLength(1)
    expect(matchedInputNames(onErrors)).toEqual([["user[enabled]"]])
  })

  it("evaluates a custom onMatchValidationError exactly once", async() => {
    const onMatchValidationError = jest.fn(() => true)
    const onErrors = jest.fn()

    render(
      <BootstrapCheckbox
        name="user[enabled]"
        onErrors={onErrors}
        onMatchValidationError={onMatchValidationError}
      />
    )
    await emitValidationErrors([entry({attribute_name: "enabled", input_name: "user[enabled]"})])

    expect(onMatchValidationError).toHaveBeenCalledTimes(1)
    expect(matchedCalls(onErrors)).toHaveLength(1)
  })
})

describe("Bootstrap Checkbox label association", () => {
  it("points the label at the rendered input when an id is given", () => {
    const {container} = render(<BootstrapCheckbox id="remember-me" label="Remember me" name="remember" />)
    const input = container.querySelector("input[type=checkbox]")
    const label = container.querySelector("label")

    expect(input.id).toBe("remember-me")
    expect(label.htmlFor).toBe("remember-me")
  })

  it("keeps the generated id consistent between label and input when none is given", () => {
    const {container} = render(<BootstrapCheckbox label="Remember me" name="remember" />)
    const input = container.querySelector("input[type=checkbox]")
    const label = container.querySelector("label")

    expect(input.id).toBeTruthy()
    expect(label.htmlFor).toBe(input.id)
  })
})
