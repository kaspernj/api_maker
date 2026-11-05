// @ts-check
import {jest} from "@jest/globals"

const mockCreate = jest.fn()
const effects = []
const mockRef = {current: undefined}
let refCreated

jest.unstable_mockModule("react", () => ({
  useLayoutEffect: (callback) => {
    effects.push(callback)
  },
  useRef: (initialValue) => {
    if (!refCreated) {
      mockRef.current = initialValue
      refCreated = true
    }

    return mockRef
  }
}))

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
    refCreated = false
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
