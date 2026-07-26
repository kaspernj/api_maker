// @ts-check
/* eslint-disable func-style, jest/max-expects, jest/require-top-level-describe, no-confusing-arrow, react/jsx-filename-extension, react/jsx-no-bind */
import {Form, FormInputs} from "formmeld"
import React, {act, createRef} from "react"
import ModelEvents from "../src/model-events.js"
import {createRoot} from "react-dom/client"
import {jest} from "@jest/globals"

jest.unstable_mockModule("prop-types-exact", () => ({default: (propTypes) => propTypes}))
jest.unstable_mockModule("i18n-on-steroids/build/src/use-i18n.js", () => ({
  default: () => ({
    t: (key) => key.endsWith("separator") ? "," : "."
  })
}))

let Input
let InputsCheckbox
let BootstrapCheckbox
let BootstrapRadioButtons
let Select

global.IS_REACT_ACT_ENVIRONMENT = true

const mountedRoots = []

beforeAll(async() => {
  Input = (await import("../src/inputs/input.jsx")).default
  InputsCheckbox = (await import("../src/inputs/checkbox.jsx")).default
  BootstrapCheckbox = (await import("../src/bootstrap/checkbox.jsx")).default
  BootstrapRadioButtons = (await import("../src/bootstrap/radio-buttons.jsx")).default
  Select = (await import("../src/inputs/select.jsx")).default
})

function render(element) {
  const container = document.createElement("div")
  const root = createRoot(container)

  document.body.appendChild(container)
  act(() => root.render(element))
  mountedRoots.push({container, root})

  return {
    container,
    rerender(nextElement) {
      act(() => root.render(nextElement))
    }
  }
}

function change(element, value, checked) {
  if (typeof checked === "boolean") {
    if (element.checked === checked) return
    act(() => element.click())
    return
  }
  if (typeof value !== "undefined") {
    const prototype = element instanceof HTMLSelectElement ? HTMLSelectElement.prototype : HTMLInputElement.prototype

    Object.getOwnPropertyDescriptor(prototype, "value").set.call(element, value)
  }
  act(() => element.dispatchEvent(new Event("change", {bubbles: true})))
}

function modelWith(value) {
  return {
    modelClass: () => ({humanAttributeName: () => "Status"}),
    modelClassData: () => ({name: "Project", paramKey: "project"}),
    status: () => value
  }
}

function autoRefreshModel(value) {
  return {
    id: () => 1,
    modelClass: () => ({humanAttributeName: () => "Status"}),
    modelClassData: () => ({name: "Project", paramKey: "project"}),
    primaryKey: () => 1,
    readAttribute: () => value,
    status: () => value
  }
}

function captureUpdatedEvent() {
  let callback
  const unsubscribe = jest.fn()

  jest.spyOn(ModelEvents, "connectUpdated").mockImplementation((_model, nextCallback) => {
    callback = nextCallback

    return {
      events: {
        addListener: jest.fn(),
        removeListener: jest.fn()
      },
      unsubscribe
    }
  })

  return {
    emit(model) {
      act(() => callback({model}))
    },
    unsubscribe
  }
}

afterEach(() => {
  while (mountedRoots.length > 0) {
    const mounted = mountedRoots.pop()

    act(() => mounted.root.unmount())
    mounted.container.remove()
  }

  jest.restoreAllMocks()
})

describe("Formmeld input integration", () => {
  it("renders unnamed and outside-Form generic controls with stable no-op writes", () => {
    const input = render(<Input />).container.querySelector("input")
    const select = render(<Select options={["one", "two"]} />).container.querySelector("select")

    expect(() => {
      change(input, "outside")
      change(select, "two")
    }).not.toThrow()
  })

  it("uses the computed model/attribute Select name for user changes", () => {
    const form = new FormInputs()
    const rendered = render(
      <Form form={form}>
        <Select attribute="status" model={modelWith("one")} options={["one", "two"]} />
      </Form>
    )

    change(rendered.container.querySelector("select"), "two")
    expect(form.getValue("project[status]")).toBe("two")
  })

  it("keeps duplicate text registrations synchronized without rewriting the origin", () => {
    const form = new FormInputs()
    const firstRef = createRef()
    const secondRef = createRef()

    render(
      <Form form={form}>
        <Input inputRef={firstRef} name="title" />
        <Input inputRef={secondRef} name="title" />
      </Form>
    )

    change(firstRef.current, "user")
    expect(firstRef.current.value).toBe("user")
    expect(secondRef.current.value).toBe("user")
    expect(form.getValue("title")).toBe("user")
  })

  it("synchronizes localized canonical and visible values for all write paths", () => {
    const form = new FormInputs()
    const rendered = render(
      <Form form={form}>
        <Input defaultValue="1234.5" localizedNumber name="amount" />
        <Input localizedNumber name="amount" />
      </Form>
    )
    const hidden = rendered.container.querySelectorAll("input[type=hidden]")
    const visible = rendered.container.querySelectorAll("input:not([type=hidden])")

    expect(hidden[0].value).toBe("1234.5")
    change(visible[0], "2,5")
    expect(form.getValue("amount")).toBe("2.5")
    expect(hidden[0].value).toBe("2.5")
    expect(hidden[1].value).toBe("2.5")
    expect(visible[1].value).toBe("2,5")

    act(() => form.setValue("amount", null))
    expect(Array.from(hidden, (element) => element.value)).toEqual(["", ""])
    expect(Array.from(visible, (element) => element.value)).toEqual(["", ""])
  })

  it("preserves controlled UI ownership while updating Formmeld values", () => {
    const form = new FormInputs()
    const rendered = render(
      <Form form={form}>
        <Input name="title" onChange={() => {}} value="owned" />
        <Select name="status" onChange={() => {}} options={["one", "two"]} value="one" />
      </Form>
    )
    const input = rendered.container.querySelector("input")
    const select = rendered.container.querySelector("select")

    change(input, "attempted")
    change(select, "two")
    expect(form.getValue("title")).toBe("attempted")
    expect(form.getValue("status")).toBe("two")
    expect(input.value).toBe("owned")
    expect(select.value).toBe("one")

    act(() => {
      form.setValue("title", "programmatic")
      form.setValue("status", "two")
    })
    expect(input.value).toBe("owned")
    expect(select.value).toBe("one")
  })

  it("retargets registration on name changes and unregisters on unmount", () => {
    const form = new FormInputs()
    const rendered = render(
      <Form form={form}>
        <Input defaultValue="first" name="first" />
      </Form>
    )

    rendered.rerender(
      <Form form={form}>
        <Input defaultValue="second" name="second" />
      </Form>
    )
    act(() => form.setValue("first", "stale"))
    expect(rendered.container.querySelector("input").value).toBe("second")
    expect(form.getValue("second")).toBe("second")
    act(() => form.setValue("second", "active"))
    expect(rendered.container.querySelector("input").value).toBe("active")

    act(() => mountedRoots.at(-1).root.unmount())
    mountedRoots.pop().container.remove()
    act(() => form.setValue("second", "after"))
    expect(form.getValue("second")).toBe("after")
  })

  it("applies a preexisting target-name value after retargeting", () => {
    const form = new FormInputs()

    form.setValue("second", "owned")
    const rendered = render(
      <Form form={form}>
        <Input defaultValue="first" name="first" />
      </Form>
    )

    rendered.rerender(
      <Form form={form}>
        <Input defaultValue="ignored" name="second" />
      </Form>
    )
    expect(rendered.container.querySelector("input").value).toBe("owned")
    expect(form.getValue("second")).toBe("owned")
  })

  it("applies the target form value after changing Form identity", () => {
    const firstForm = new FormInputs()
    const secondForm = new FormInputs()

    secondForm.setValue("title", "second-owned")
    const rendered = render(
      <Form form={firstForm}>
        <Input defaultValue="first" name="title" />
      </Form>
    )

    rendered.rerender(
      <Form form={secondForm}>
        <Input defaultValue="ignored" name="title" />
      </Form>
    )
    expect(rendered.container.querySelector("input").value).toBe("second-owned")
    expect(secondForm.getValue("title")).toBe("second-owned")
  })

  it("keeps same-name defaultValue updates uncontrolled", () => {
    const form = new FormInputs()
    const rendered = render(
      <Form form={form}>
        <Input defaultValue="first" name="title" />
      </Form>
    )

    rendered.rerender(
      <Form form={form}>
        <Input defaultValue="second" name="title" />
      </Form>
    )
    expect(rendered.container.querySelector("input").value).toBe("first")
    expect(form.getValue("title")).toBe("first")
  })

  it("applies lone outside-Form text model refreshes to the mounted origin", () => {
    const event = captureUpdatedEvent()
    const initialModel = autoRefreshModel("before")
    const rendered = render(
      <Input attribute="status" autoRefresh model={initialModel} />
    )

    event.emit(autoRefreshModel("after"))
    expect(rendered.container.querySelector("input").value).toBe("after")
  })

  it("applies lone outside-Form localized refreshes to canonical and visible inputs", () => {
    const event = captureUpdatedEvent()
    const initialModel = autoRefreshModel("1.5")
    const rendered = render(
      <Input attribute="status" autoRefresh localizedNumber model={initialModel} />
    )

    event.emit(autoRefreshModel("2.5"))
    expect(rendered.container.querySelector("input[type=hidden]").value).toBe("2.5")
    expect(rendered.container.querySelector("input:not([type=hidden])").value).toBe("2,5")
  })

  it("applies lone outside-Form checkbox refreshes as booleans", () => {
    const event = captureUpdatedEvent()
    const initialModel = autoRefreshModel(false)
    const rendered = render(
      <InputsCheckbox attribute="status" autoRefresh model={initialModel} />
    )

    event.emit(autoRefreshModel(1))
    expect(rendered.container.querySelector("input[type=checkbox]").checked).toBe(true)
  })

  it("routes computed-name text model refreshes through FormInputs ownership", () => {
    const event = captureUpdatedEvent()
    const form = new FormInputs()
    const setValue = jest.spyOn(form, "setValue")
    const initialModel = autoRefreshModel("before")
    const rendered = render(
      <Form form={form}>
        <Input attribute="status" autoRefresh model={initialModel} />
        <Input name="project[status]" />
      </Form>
    )

    event.emit(autoRefreshModel("after"))
    expect(setValue).toHaveBeenCalledWith("project[status]", "after")
    expect(Array.from(rendered.container.querySelectorAll("input"), (input) => input.value)).toEqual(["after", "after"])
    expect(form.getValue("project[status]")).toBe("after")
  })

  it("applies localized text model refreshes to canonical, visible, and FormInputs values", () => {
    const event = captureUpdatedEvent()
    const form = new FormInputs()
    const initialModel = autoRefreshModel("1.5")
    const rendered = render(
      <Form form={form}>
        <Input attribute="status" autoRefresh localizedNumber model={initialModel} />
      </Form>
    )

    event.emit(autoRefreshModel("2.5"))
    expect(rendered.container.querySelector("input[type=hidden]").value).toBe("2.5")
    expect(rendered.container.querySelector("input:not([type=hidden])").value).toBe("2,5")
    expect(form.getValue("project[status]")).toBe("2.5")
  })

  it("applies checkbox model refreshes to the mounted origin and FormInputs", () => {
    const event = captureUpdatedEvent()
    const form = new FormInputs()
    const initialModel = autoRefreshModel(false)
    const rendered = render(
      <Form form={form}>
        <InputsCheckbox attribute="status" autoRefresh model={initialModel} />
      </Form>
    )

    event.emit(autoRefreshModel(1))
    expect(rendered.container.querySelector("input[type=checkbox]").checked).toBe(true)
    expect(form.getValue("project[status]")).toBe(true)
  })

  it.each([
    ["unchecked", {}, false],
    ["checked", {defaultChecked: true}, true],
    ["custom numeric defaultValue", {defaultChecked: true, defaultValue: 7}, true],
    ["numeric model value", {attribute: "status", model: autoRefreshModel(1)}, true]
  ])("owns boolean checkbox values for %s", (_label, props, expected) => {
    const form = new FormInputs()

    render(
      <Form form={form}>
        <InputsCheckbox name="enabled" {...props} />
      </Form>
    )
    expect(form.getValue("enabled")).toBe(expected)
    expect(form.asObject()).toEqual({enabled: expected})
  })

  it("preserves boolean Form object and native HTML submission semantics", () => {
    const form = new FormInputs()
    const rendered = render(
      <Form form={form} useHtmlForm>
        <InputsCheckbox defaultChecked name="enabled" />
      </Form>
    )
    const checkbox = rendered.container.querySelector("input[type=checkbox]")
    const htmlForm = rendered.container.querySelector("form")

    expect(checkbox.value).toBe("1")
    expect(form.asObject()).toEqual({enabled: true})
    expect(new FormData(htmlForm).getAll("enabled")).toEqual(["0", "1"])

    change(checkbox, undefined, false)
    expect(form.asObject()).toEqual({enabled: false})
    expect(new FormData(htmlForm).getAll("enabled")).toEqual(["0"])
  })

  it("keeps zeroInput presentation separate from boolean FormInputs ownership", () => {
    const form = new FormInputs()
    const rendered = render(
      <Form form={form} useHtmlForm>
        <InputsCheckbox defaultChecked name="enabled" zeroInput={false} />
      </Form>
    )
    const htmlForm = rendered.container.querySelector("form")

    expect(form.asObject()).toEqual({enabled: true})
    expect(new FormData(htmlForm).getAll("enabled")).toEqual(["1"])
  })

  it("normalizes checkbox programmatic values and synchronizes duplicates", () => {
    const form = new FormInputs()
    const rendered = render(
      <Form form={form}>
        <InputsCheckbox name="enabled" zeroInput={false} />
        <InputsCheckbox name="enabled" zeroInput={false} />
      </Form>
    )
    const checkboxes = rendered.container.querySelectorAll("input[type=checkbox]")

    act(() => form.setValue("enabled", 1))
    expect(Array.from(checkboxes, (element) => element.checked)).toEqual([true, true])
    change(checkboxes[0], undefined, false)
    expect(Array.from(checkboxes, (element) => element.checked)).toEqual([false, false])
    expect(form.getValue("enabled")).toBe(false)
  })

  it("registers Bootstrap checkbox once through user, programmatic, and unmount lifecycles", () => {
    const form = new FormInputs()
    const registerField = jest.spyOn(form, "registerField")
    const rendered = render(
      <Form form={form}>
        <BootstrapCheckbox name="enabled" />
      </Form>
    )
    const checkbox = rendered.container.querySelector("input[type=checkbox]")

    expect(registerField).toHaveBeenCalledTimes(1)
    change(checkbox, undefined, true)
    expect(form.getValue("enabled")).toBe(true)
    act(() => form.setValue("enabled", false))
    expect(checkbox.checked).toBe(false)

    act(() => mountedRoots.at(-1).root.unmount())
    mountedRoots.pop().container.remove()
    act(() => form.setValue("enabled", true))
    expect(form.getValue("enabled")).toBe(true)
  })

  it("submits Bootstrap radio user selections through FormInputs", () => {
    const form = new FormInputs()
    const rendered = render(
      <Form form={form}>
        <BootstrapRadioButtons
          collection={[["Draft", "draft"], ["Published", "published"]]}
          defaultValue="draft"
          name="status"
        />
      </Form>
    )
    const radios = rendered.container.querySelectorAll("input[type=radio]")

    expect(form.asObject()).toEqual({status: "draft"})
    change(radios[1], undefined, true)
    expect(form.asObject()).toEqual({status: "published"})
  })

  it("applies programmatic FormInputs values to the visible Bootstrap radio", () => {
    const form = new FormInputs()
    const registerField = jest.spyOn(form, "registerField")
    const rendered = render(
      <Form form={form}>
        <BootstrapRadioButtons
          collection={[["Draft", "draft"], ["Published", "published"]]}
          defaultValue="draft"
          name="status"
        />
      </Form>
    )
    const radios = rendered.container.querySelectorAll("input[type=radio]")

    expect(registerField).toHaveBeenCalledTimes(1)
    act(() => form.setValue("status", "published"))
    expect(Array.from(radios, (radio) => radio.checked)).toEqual([false, true])
  })

  it("preserves controlled Bootstrap radio UI ownership while updating FormInputs", () => {
    const form = new FormInputs()
    const rendered = render(
      <Form form={form}>
        <BootstrapRadioButtons
          collection={[["Draft", "draft"], ["Published", "published"]]}
          name="status"
          onChange={() => {}}
          value="draft"
        />
      </Form>
    )
    const radios = rendered.container.querySelectorAll("input[type=radio]")

    expect(Array.from(radios, (radio) => radio.checked)).toEqual([true, false])
    change(radios[1], undefined, true)
    expect(form.getValue("status")).toBe("published")
    expect(Array.from(radios, (radio) => radio.checked)).toEqual([true, false])
    act(() => form.setValue("status", "published"))
    expect(Array.from(radios, (radio) => radio.checked)).toEqual([true, false])
  })
})
