import {jest} from "@jest/globals"

const ApiMakerInputMock = jest.fn(() => null)
const CheckboxMock = jest.fn(() => null)

await jest.unstable_mockModule("../src/inputs/input", () => ({
  default: ApiMakerInputMock
}))

await jest.unstable_mockModule("../src/inputs/checkbox", () => ({
  default: CheckboxMock
}))

await jest.unstable_mockModule("set-state-compare/build/shape-component.js", () => ({
  ShapeComponent: class ShapeComponent {},
  shapeComponent: (value) => value
}))

await jest.unstable_mockModule("set-state-compare/build/memo.js", () => ({
  default: (value) => value
}))

await jest.unstable_mockModule("../src/base-component", () => ({
  default: class BaseComponent {
    constructor(props = {}) {
      this.props = props
      this.p = props
    }
  }
}))

await jest.unstable_mockModule("../src/use-input.js", () => ({
  default: jest.fn(() => ({
    inputProps: {id: "attachment", name: "record[image]"}
  }))
}))

await jest.unstable_mockModule("i18n-on-steroids/src/use-i18n.mjs", () => ({
  default: () => ({t: () => "Delete"})
}))

const {default: ApiMakerAttachment} = await import("../src/inputs/attachment.jsx")

describe("ApiMakerAttachment", () => {
  it("passes file type through to ApiMakerInput", () => {
    const model = {}
    const component = new ApiMakerAttachment({model})

    component.s = {purgeChecked: false}
    component.tt = {
      inputProps: {id: "attachment", name: "record[image]"},
      t: () => "Delete"
    }
    component.getUrl = () => null
    component.isImage = () => false

    const rendered = component.render()
    const inputElement = rendered.props.children[2]

    expect(inputElement.type).toBe(ApiMakerInputMock)
    expect(inputElement.props.type).toBe("file")
    expect(inputElement.props.inputProps.type).toBe("file")
  })
})
