import {jest} from "@jest/globals"

const mockUseCallback = jest.fn((callback) => callback)
const mockUseEffect = jest.fn()
const mockUseRef = jest.fn((value) => ({current: value}))
const mockUseQueryParams = jest.fn()
const mockUseShape = jest.fn()
const mockUseUpdatedEvent = jest.fn()
const mockQueryFirst = jest.fn()

jest.unstable_mockModule("react", () => {
  const actual = jest.requireActual("react")

  return {
    ...actual,
    useCallback: (...args) => mockUseCallback(...args),
    useEffect: (...args) => mockUseEffect(...args),
    useRef: (...args) => mockUseRef(...args)
  }
})

jest.unstable_mockModule("on-location-changed/build/use-query-params.js", () => ({
  __esModule: true,
  default: (...args) => mockUseQueryParams(...args)
}))

jest.unstable_mockModule("../src/use-shape.js", () => ({
  __esModule: true,
  default: (...args) => mockUseShape(...args)
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
    mockUseCallback.mockClear()
    mockUseEffect.mockClear()
    mockUseRef.mockClear()
    mockUseQueryParams.mockReset()
    mockUseShape.mockReset()
    mockUseUpdatedEvent.mockReset()
    mockQueryFirst.mockReset()
  })

  it("does not crash when query params are undefined and newIfNoId is used", async() => {
    mockUseQueryParams.mockReturnValue(undefined)

    mockUseShape.mockImplementation((props) => {
      const state = {}
      const meta = {}

      return {
        meta,
        props,
        state,
        m: meta,
        p: props,
        s: state,
        set: (statesList) => Object.assign(state, statesList),
        updateMeta: (newMeta) => Object.assign(meta, newMeta),
        useStates: (statesList) => Object.assign(state, statesList)
      }
    })

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

    mockUseShape.mockImplementation((props) => {
      const state = {
        model: new FakeSchoolClass({
          data: {a: {id: "old-school-class-id"}}
        }),
        notFound: false
      }
      const meta = {}

      return {
        meta,
        props,
        state,
        m: meta,
        p: props,
        s: state,
        set: (statesList) => Object.assign(state, statesList),
        updateMeta: (newMeta) => Object.assign(meta, newMeta),
        useStates: () => {}
      }
    })

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

    const loadedModel = new FakeSchoolClass({
      data: {a: {id: "school-class-id"}}
    })

    mockUseShape.mockImplementation((props) => {
      const state = {
        model: loadedModel,
        notFound: false
      }
      const meta = {}

      return {
        meta,
        props,
        state,
        m: meta,
        p: props,
        s: state,
        set: (statesList) => Object.assign(state, statesList),
        updateMeta: (newMeta) => Object.assign(meta, newMeta),
        useStates: () => {}
      }
    })

    const {default: useModel} = await import("../src/use-model.js")

    useModel(FakeSchoolClass, {
      eventUpdated: true,
      loadByQueryParam: () => "school-class-id"
    })

    expect(mockUseUpdatedEvent).toHaveBeenCalledTimes(1)
    expect(mockUseUpdatedEvent).toHaveBeenCalledWith(
      loadedModel,
      expect.any(Function),
      {onConnected: expect.any(Function)}
    )

    const [, reloadModel, props] = mockUseUpdatedEvent.mock.calls[0]

    expect(props.onConnected).toBe(reloadModel)
  })

  it("does not subscribe to update events when eventUpdated is not enabled", async() => {
    mockUseQueryParams.mockReturnValue({})

    const loadedModel = new FakeSchoolClass({
      data: {a: {id: "school-class-id"}}
    })

    mockUseShape.mockImplementation((props) => {
      const state = {
        model: loadedModel,
        notFound: false
      }
      const meta = {}

      return {
        meta,
        props,
        state,
        m: meta,
        p: props,
        s: state,
        set: (statesList) => Object.assign(state, statesList),
        updateMeta: (newMeta) => Object.assign(meta, newMeta),
        useStates: () => {}
      }
    })

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

    const state = {
      model: new FakeSchoolClass({
        data: {a: {id: "school-class-id", fullCacheKey: "same-model"}}
      }),
      notFound: false
    }
    const set = jest.fn((statesList) => Object.assign(state, statesList))

    mockQueryFirst.mockResolvedValue(
      new FakeSchoolClass({
        data: {a: {id: "school-class-id", fullCacheKey: "same-model"}}
      })
    )

    mockUseShape.mockImplementation((props) => {
      const meta = {}

      return {
        meta,
        props,
        state,
        m: meta,
        p: props,
        s: state,
        set,
        updateMeta: (newMeta) => Object.assign(meta, newMeta),
        useStates: () => {}
      }
    })

    const {default: useModel} = await import("../src/use-model.js")

    useModel(FakeSchoolClass, {
      eventUpdated: true,
      loadByQueryParam: () => "school-class-id"
    })

    const [, , props] = mockUseUpdatedEvent.mock.calls[0]

    await props.onConnected()

    expect(set).not.toHaveBeenCalled()
  })
})
