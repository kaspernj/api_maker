// @ts-check
import {forwardRef} from "react"
import withDefaultStyleSlot from "../src/utils/with-default-style-slot.jsx"

const NamedComponent = forwardRef(() => null)

NamedComponent.displayName = "NamedComponent"

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

  it("falls back to the slot key when the wrapped component has no name", () => {
    // Pass a bare object so neither `displayName` nor `name` resolve, exercising the slotKey fallback.
    const stub = /** @type {any} */ ({})
    const Wrapped = withDefaultStyleSlot(stub, "FallbackSlot")

    expect(Wrapped.displayName).toBe("WithDefaultStyleSlot(FallbackSlot)")
  })
})
