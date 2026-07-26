import {existsSync, readFileSync, readdirSync} from "node:fs"
import {FormInputs} from "formmeld"
import apiMakerConfig from "../src/config.js"
import applyFormFieldValue from "../src/inputs/apply-form-field-value.js"
import {fileURLToPath} from "node:url"
import {jest} from "@jest/globals"

const packageRoot = fileURLToPath(new URL("..", import.meta.url))
const isSourcePath = (path) => typeof path == "string" && (/\.(?:js|jsx)$/).test(path)

describe("Formmeld extraction", () => {
  it("does not restore a local form module or local form imports", () => {
    expect(existsSync(`${packageRoot}/src/form.jsx`)).toBe(false)

    const sourcePaths = readdirSync(`${packageRoot}/src`, {recursive: true})
      .filter(isSourcePath)

    for (const relativePath of sourcePaths) {
      const path = `${packageRoot}/src/${relativePath}`
      const source = readFileSync(path, "utf8")

      expect(source).not.toMatch(/from\s+["'][^"']*\/form(?:\.jsx?)?["']/)
      expect(source).not.toMatch(/export[^\n;]*\b(?:Form|FormInputs|FormContext|useForm|useFieldRegistration)\b/)
    }
  })

  it("removes the API Maker HTML form configuration", () => {
    expect(apiMakerConfig.getUseHtmlForm).toBeUndefined()
    expect(apiMakerConfig.setUseHtmlForm).toBeUndefined()
  })

  it("applies text values to DOM-compatible uncontrolled fields", () => {
    const input = {value: "before"}

    applyFormFieldValue(input, "after")

    expect(input.value).toBe("after")
  })

  it("applies checked values to DOM-compatible uncontrolled fields", () => {
    const input = {checked: false}

    applyFormFieldValue(input, true, {checkbox: true})

    expect(input.checked).toBe(true)
  })

  it("uses React Native imperative props when available", () => {
    const setNativeProps = jest.fn()

    applyFormFieldValue({setNativeProps}, "after")

    expect(setNativeProps).toHaveBeenCalledWith({text: "after"})
  })

  it("collects user edits without writing back to the originating field", () => {
    const form = new FormInputs()
    const applyValue = jest.fn()
    const field = form.registerField("name", {applyValue, initialValue: "before"})

    field.setValue("after")

    expect(form.getValue("name")).toBe("after")
    expect(applyValue).not.toHaveBeenCalled()
  })

  it("applies programmatic values and synchronizes duplicate names", () => {
    const form = new FormInputs()
    const firstInput = {value: "first"}
    const secondInput = {value: "second"}

    form.registerField("name", {
      applyValue: (value) => applyFormFieldValue(firstInput, value),
      initialValue: firstInput.value
    })
    form.registerField("name", {
      applyValue: (value) => applyFormFieldValue(secondInput, value),
      initialValue: secondInput.value
    })
    form.setValue("name", "programmatic")

    expect(firstInput.value).toBe("programmatic")
    expect(secondInput.value).toBe("programmatic")
  })

  it("stops applying values after a field unregisters without unsetting ownership", () => {
    const form = new FormInputs()
    const input = {value: "before"}
    const field = form.registerField("name", {
      applyValue: (value) => applyFormFieldValue(input, value),
      initialValue: input.value
    })

    field.unregister()
    form.setValue("name", "after")

    expect(input.value).toBe("before")
    expect(form.getValue("name")).toBe("after")
  })
})
