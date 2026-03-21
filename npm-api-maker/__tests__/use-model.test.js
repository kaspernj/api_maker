import {jest} from "@jest/globals"

const mockUseCallback = jest.fn((callback) => callback)
const mockUseEffect = jest.fn()
const mockUseRef = jest.fn((value) => ({current: value}))
const mockUseQueryParams = jest.fn()
const mockUseShape = jest.fn()

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

    constructor(args) {
      this.args = args
    }

    id() {
      return this.args.data.a.id
    }
  }

  beforeEach(() => {
    mockUseCallback.mockClear()
    mockUseEffect.mockClear()
    mockUseRef.mockClear()
    mockUseQueryParams.mockReset()
    mockUseShape.mockReset()
    Object.defineProperty(globalThis, "location", {
      configurable: true,
      value: {search: ""}
    })
  })

  it("uses location query params when the query params context is undefined", async() => {
    mockUseQueryParams.mockReturnValue(undefined)
    Object.defineProperty(globalThis, "location", {
      configurable: true,
      value: {search: "?school_class[name]=The%20Pack"}
    })

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
      data: {a: {name: "The Pack"}},
      isNewRecord: true
    })
  })

  it("does not crash when query params and location are unavailable", async() => {
    mockUseQueryParams.mockReturnValue(undefined)
    Object.defineProperty(globalThis, "location", {
      configurable: true,
      value: undefined
    })

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
})
