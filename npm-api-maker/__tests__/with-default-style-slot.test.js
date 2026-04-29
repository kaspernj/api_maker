// @ts-check
import withDefaultStyleSlot from "../src/utils/with-default-style-slot.jsx"

const NamedComponent = () => null

NamedComponent.displayName = "NamedComponent"

const AnonymousComponent = function () {
  return null
}

describe("withDefaultStyleSlot", () => {
  it("returns a React component", () => {
    const Wrapped = withDefaultStyleSlot(NamedComponent, "Slot")

    expect(typeof Wrapped).toBe("object")
    expect(Wrapped.$$typeof).toBeDefined()
  })

  it("derives displayName from the wrapped component", () => {
    const Wrapped = withDefaultStyleSlot(NamedComponent, "Slot")

    expect(Wrapped.displayName).toBe("WithDefaultStyleSlot(NamedComponent)")
  })

  it("falls back to the function name when no displayName is set", () => {
    const Wrapped = withDefaultStyleSlot(AnonymousComponent, "Slot")

    expect(Wrapped.displayName).toBe("WithDefaultStyleSlot(AnonymousComponent)")
  })

  it("falls back to the slot key when neither displayName nor name is set", () => {
    const Wrapped = withDefaultStyleSlot(
      // eslint-disable-next-line no-new-func
      Object.defineProperty(() => null, "name", {value: ""}),
      "FallbackSlot"
    )

    expect(Wrapped.displayName).toBe("WithDefaultStyleSlot(FallbackSlot)")
  })
})
