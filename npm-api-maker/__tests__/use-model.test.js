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
})
