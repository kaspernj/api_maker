// @ts-check
/* eslint-disable react/jsx-filename-extension */
import React, {act} from "react"
import {createRoot} from "react-dom/client"
import {jest} from "@jest/globals"

jest.unstable_mockModule("prop-types-exact", () => ({default: (propTypes) => propTypes}))
jest.unstable_mockModule("i18n-on-steroids/build/src/use-i18n.js", () => ({
  default: () => ({t: (key) => key})
}))

let FormContext
let FormInputs
let InputsInput

global.IS_REACT_ACT_ENVIRONMENT = true

const mountedRoots = []

beforeAll(async() => {
  ({FormContext, FormInputs} = await import("formmeld"))
  InputsInput = (await import("../src/inputs/input.jsx")).default
})

function render(element) {
  const container = document.createElement("div")
  const root = createRoot(container)

  document.body.appendChild(container)
  act(() => root.render(element))
  mountedRoots.push({container, root})

  return {container, root}
}

afterEach(() => {
  while (mountedRoots.length > 0) {
    const mounted = mountedRoots.pop()

    act(() => mounted.root.unmount())
    mounted.container.remove()
  }
})

describe("useRetargetedFieldValue", () => {
  it("does not overwrite a user-edited field when the Formmeld form becomes available after mount", () => {
    const form = new FormInputs()
    const tree = (formValue) => (
      <FormContext.Provider value={formValue}>
        <InputsInput defaultValue="Admin" name="user[first_name]" />
      </FormContext.Provider>
    )

    const {container, root} = render(tree(null))
    const input = container.querySelector("input")

    act(() => {
      input.value = "Donald"
      input.dispatchEvent(new Event("input", {bubbles: true}))
    })

    // The form only becomes available after the field has already mounted and
    // been edited by the user; re-binding the same field must not clobber it.
    act(() => root.render(tree(form)))

    expect(input.value).toBe("Donald")
  })
})
