// @ts-check
import {jest} from "@jest/globals"

const mockCreate = jest.fn()
const effects = []
let shapeHookInstance

jest.unstable_mockModule("react", () => ({
  useLayoutEffect: (callback) => {
    effects.push(callback)
  }
}))

jest.unstable_mockModule("set-state-compare", () => ({
  ShapeHook: class MockShapeHook {
    constructor(props) {
      this.props = props
      this.p = props
      this.state = {}
    }
  },
  // One instance per component, like the real useShapeHook: props are replaced
  // each render while the instance the subscription closure holds stays.
  useShapeHook: (ShapeHookClass, props) => {
    if (shapeHookInstance) {
      shapeHookInstance.props = props
      shapeHookInstance.p = props
    } else {
      shapeHookInstance = new ShapeHookClass(props)
    }

    shapeHookInstance.setup()

    return shapeHookInstance
  }
}))

jest.unstable_mockModule("prop-types-exact", () => ({default: (propTypes) => propTypes}))

jest.unstable_mockModule("../src/channels-consumer.js", () => ({
  __esModule: true,
  default: () => ({subscriptions: {create: mockCreate}})
}))

/** Runs the effects the hook registered during the current render and returns their cleanups. */
const runEffects = () => {
  const cleanups = effects.map((effect) => effect())

  effects.length = 0
  return cleanups.filter(Boolean)
}

describe("useSubscription", () => {
  beforeEach(() => {
    mockCreate.mockClear()
    effects.length = 0
    shapeHookInstance = undefined
  })

  it("creates a subscription for the given channel args", async () => {
    const {default: useSubscription} = await import("../src/use-subscription.js")

    useSubscription({args: {channel: "EmailConfirmChannel", email: "test@example.com"}, onReceive: jest.fn()})

    runEffects()

    expect(mockCreate).toHaveBeenCalledTimes(1)
    expect(mockCreate.mock.calls[0][0]).toEqual({channel: "EmailConfirmChannel", email: "test@example.com"})
  })

  it("does not create a subscription when inactive", async () => {
    const {default: useSubscription} = await import("../src/use-subscription.js")

    useSubscription({active: false, args: {channel: "EmailConfirmChannel", email: "test@example.com"}, onReceive: jest.fn()})

    runEffects()

    expect(mockCreate).not.toHaveBeenCalled()
  })

  it("unsubscribes when the component using the hook goes away", async () => {
    const {default: useSubscription} = await import("../src/use-subscription.js")
    const mockUnsubscribe = jest.fn()

    mockCreate.mockImplementation(() => ({unsubscribe: mockUnsubscribe}))

    useSubscription({args: {channel: "EmailConfirmChannel", email: "test@example.com"}, onReceive: jest.fn()})

    const cleanups = runEffects()

    cleanups[0]()

    expect(mockUnsubscribe).toHaveBeenCalledTimes(1)
  })

  it("passes payloads to the handler from the current render", async () => {
    const {default: useSubscription} = await import("../src/use-subscription.js")
    const firstHandler = jest.fn()
    const secondHandler = jest.fn()

    useSubscription({args: {channel: "EmailConfirmChannel", email: "test@example.com"}, onReceive: firstHandler})
    runEffects()

    const callbacks = mockCreate.mock.calls[0][1]

    useSubscription({args: {channel: "EmailConfirmChannel", email: "test@example.com"}, onReceive: secondHandler})
    runEffects()

    callbacks.received({confirmed: true})

    expect(secondHandler).toHaveBeenCalledWith({confirmed: true})
    expect(firstHandler).not.toHaveBeenCalled()
  })
})
