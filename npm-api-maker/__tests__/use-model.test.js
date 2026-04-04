import {jest} from "@jest/globals"

const mockUseEffect = jest.fn()
const mockUseQueryParams = jest.fn()
const mockUseUpdatedEvent = jest.fn()
const mockQueryFirst = jest.fn()
let lastShapeHook

jest.unstable_mockModule("react", () => {
  const actual = jest.requireActual("react")

  return {
    ...actual,
    useEffect: (...args) => mockUseEffect(...args)
  }
})

jest.unstable_mockModule("set-state-compare", () => {
  class MockShapeHook {
    constructor(props) {
      this.props = props
      this.p = props
      this.state = {}
      this.s = this.state
    }

    setState = (statesList) => {
      Object.assign(this.state, statesList)
    }

    setInstance(instances) {
      Object.assign(this, instances)
    }

    useStates(statesList) {
      Object.keys(statesList).forEach((key) => {
        const value = statesList[key]

        if (!(key in this.state)) {
          this.state[key] = typeof value == "function" ? value() : value
        }
      })
    }
  }

  return {
    __esModule: true,
    ShapeHook: MockShapeHook,
    useShapeHook: (ShapeHookClass, props) => {
      const shapeHook = new ShapeHookClass(props)

      shapeHook.setup()
      lastShapeHook = shapeHook

      return shapeHook
    }
  }
})

jest.unstable_mockModule("on-location-changed/build/use-query-params.js", () => ({
  __esModule: true,
  default: (...args) => mockUseQueryParams(...args)
}))

jest.unstable_mockModule("../src/use-updated-event.js", () => ({
  __esModule: true,
  default: (...args) => mockUseUpdatedEvent(...args)
}))

describe("useModel", () => {
  class FakeSchoolClass {
    static modelClassData() {
      return {
        name: "SchoolClass",
        paramKey: "school_class"
      }
    }

    static modelName() {
      return {
        paramKey: () => "school_class"
      }
    }

    static primaryKey() {
      return "id"
    }

    static ransack() {
      return {
        first: mockQueryFirst
      }
    }

    constructor(args) {
      this.args = args
    }

    id() {
      return this.args.data.a.id
    }

    fullCacheKey() {
      return this.args.data.a.fullCacheKey || this.args.data.a.id
    }
  }

  beforeEach(() => {
    lastShapeHook = undefined
    mockUseEffect.mockClear()
    mockUseQueryParams.mockReset()
    mockUseUpdatedEvent.mockReset()
    mockQueryFirst.mockReset()
  })

  it("does not crash when query params are undefined and newIfNoId is used", async() => {
    mockUseQueryParams.mockReturnValue(undefined)

    const {default: useModel} = await import("../src/use-model.js")
    let result

    expect(() => {
      result = useModel(FakeSchoolClass, {
        match: {params: {}},
        newIfNoId: true
      })
    }).not.toThrow()

    expect(result.schoolClass).toBeInstanceOf(FakeSchoolClass)
    expect(result.schoolClass.args).toEqual({
      data: {a: {}},
      isNewRecord: true
    })
  })

  it("does not expose a stale loaded model after the query-param ID changes", async() => {
    mockUseQueryParams.mockReturnValue({school_class_id: "new-school-class-id"})

    const {default: useModel} = await import("../src/use-model.js")
    const result = useModel(FakeSchoolClass, {
      active: true,
      loadByQueryParam: ({queryParams}) => queryParams.school_class_id
    })

    expect(result.schoolClassId).toBe("new-school-class-id")
    expect(result.schoolClass).toBeUndefined()
    expect(result.schoolClassNotFound).toBeUndefined()
  })

  it("reloads the model when the update subscription connects for eventUpdated models", async() => {
    mockUseQueryParams.mockReturnValue({})

    const {default: useModel} = await import("../src/use-model.js")

    useModel(FakeSchoolClass, {
      eventUpdated: true,
      loadByQueryParam: () => "school-class-id"
    })

    expect(mockUseUpdatedEvent).toHaveBeenCalledTimes(1)
    expect(mockUseUpdatedEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        args: {
          data: {a: {id: "school-class-id"}}
        }
      }),
      expect.any(Function),
      {onConnected: expect.any(Function)}
    )

    const [, reloadModel, props] = mockUseUpdatedEvent.mock.calls[0]

    expect(props.onConnected).toBe(reloadModel)
  })

  it("does not subscribe to update events when eventUpdated is not enabled", async() => {
    mockUseQueryParams.mockReturnValue({})

    const {default: useModel} = await import("../src/use-model.js")

    useModel(FakeSchoolClass, {
      loadByQueryParam: () => "school-class-id"
    })

    expect(mockUseUpdatedEvent).toHaveBeenCalledTimes(1)
    expect(mockUseUpdatedEvent).toHaveBeenCalledWith(
      undefined,
      expect.any(Function),
      {onConnected: expect.any(Function)}
    )
  })

  it("does not set state again when the connected reload returns the same model data", async() => {
    mockUseQueryParams.mockReturnValue({})

    const sameModel = new FakeSchoolClass({
      data: {a: {id: "school-class-id", fullCacheKey: "same-model"}}
    })

    mockQueryFirst.mockResolvedValue(
      new FakeSchoolClass({
        data: {a: {id: "school-class-id", fullCacheKey: "same-model"}}
      })
    )

    const {default: useModel} = await import("../src/use-model.js")
    useModel(FakeSchoolClass, {
      eventUpdated: true,
      loadByQueryParam: () => "school-class-id"
    })
    const [, reloadModel] = mockUseUpdatedEvent.mock.calls[0]
    const originalSetState = lastShapeHook.setState
    const setStateSpy = jest.spyOn(lastShapeHook, "setState")

    lastShapeHook.state.model = sameModel
    lastShapeHook.state.notFound = false
    setStateSpy.mockImplementation((statesList) => originalSetState(statesList))
    await reloadModel()

    expect(setStateSpy).not.toHaveBeenCalled()
    expect(mockQueryFirst).toHaveBeenCalledTimes(1)
  })

  it("waits for the update subscription to connect before the first load when the model ID is known", async() => {
    mockUseQueryParams.mockReturnValue({})
    const loadedModel = new FakeSchoolClass({
      data: {a: {id: "school-class-id", fullCacheKey: "school-class-id"}}
    })

    mockQueryFirst.mockResolvedValue(loadedModel)

    const {default: useModel} = await import("../src/use-model.js")

    useModel(FakeSchoolClass, {
      eventUpdated: true,
      loadByQueryParam: () => "school-class-id"
    })

    expect(mockQueryFirst).not.toHaveBeenCalled()

    const [, onUpdated, props] = mockUseUpdatedEvent.mock.calls[0]

    expect(props.onConnected).toBe(onUpdated)

    await props.onConnected()

    expect(mockQueryFirst).toHaveBeenCalledTimes(1)
    expect(lastShapeHook.state.model).toBe(loadedModel)
  })
})
