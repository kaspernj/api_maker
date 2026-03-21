/* eslint-disable no-unused-vars, no-use-before-define, prefer-object-spread, sort-imports */
import {ShapeHook, useShapeHook} from "set-state-compare"
import debounce from "debounce"
import {digg} from "diggerize"
import * as inflection from "inflection"
import ModelEvents from "./model-events.js"
import {useEffect} from "react"
import useCreatedEvent from "./use-created-event.js"
import useQueryParams from "on-location-changed/build/use-query-params.js"

/**
 * @typedef {object} UseCollectionResult
 * @property {Array<import("./base-model.js").default>} models
 * @property {string} modelIdsCacheString
 * @property {number} overallCount
 * @property {import("./collection.js").default} query
 * @property {string} queryName
 * @property {string} queryPerKey
 * @property {string} queryQName
 * @property {string} querySName
 * @property {string} queryPageName
 * @property {import("./result.js").default} result
 * @property {string[]} searchParams
 * @property {false | import("react").ReactNode} showNoRecordsAvailableContent
 * @property {false | import("react").ReactNode} showNoRecordsFoundContent
 */

/**
 * @param {object} props
 * @param {Record<string, string[]>} props.abilities
 * @param {import("./collection.js").default} props.collection
 * @param {Record<string, any>} props.defaultParams
 * @param {string[]} props.groupBy
 * @param {function() : boolean} props.ifCondition
 * @param {number} props.limit
 * @param {typeof import("./base-model.js").default} props.modelClass
 * @param {function() : import("react").ReactNode} props.noRecordsAvailableContent
 * @param {function() : import("react").ReactNode} props.noRecordsFoundContent
 * @param {function() : void} props.onModelsLoaded
 * @param {boolean} props.pagination
 * @param {string[]} props.preloads
 * @param {function({query: import("./collection.js").default}) : import("./collection.js").default} props.queryMethod
 * @param {string} props.queryName
 * @param {Record<string, any>} props.ransack
 * @param {Record<string, string[]>} props.select
 * @param {Record<string, string[]>} props.selectColumns
 * @param {any[]} cacheKeys
 * @returns {UseCollectionResult & Record<string, any>}
 */
/** Hook state container for useCollection. */
class UseCollectionShapeHook extends ShapeHook {
  /** Constructor. */
  constructor(props) {
    super(props)
    this.loadModelsGeneration = 0
    this.loadOverallCountGeneration = 0
    this.queryParams = undefined
  }

  /** @returns {string} */
  queryName() {
    return this.p.queryName || digg(this.p.modelClass.modelClassData(), "collectionKey")
  }

  /** @returns {string} */
  queryPerKey() {
    return `${this.queryName()}_per`
  }

  /** @returns {string} */
  queryQName() {
    return `${this.queryName()}_q`
  }

  /** @returns {string} */
  querySName() {
    return `${this.queryName()}_s`
  }

  /** @returns {string} */
  queryPageName() {
    return `${this.queryName()}_page`
  }

  /** @returns {string} */
  modelIdsCacheString() {
    if (this.s.models === undefined) {
      return "models-undefined"
    } else if (this.s.models.length === 0) {
      return "no-models"
    } else {
      return this.s.models.map((model) => model.cacheKey())?.join("---")
    }
  }

  /** @returns {Function & {clear?: () => void}} */
  loadModelsDebounce() {
    return this.cache("loadModelsDebounce", () => debounce(() => this.loadModels()))
  }

  /** @param {Record<string, any>} args */
  showNoRecordsAvailableContent(args) {
    let models, overallCount

    if (args.models !== undefined) {
      models = args.models
    } else if (this.s.models !== undefined) {
      models = this.s.models
    }

    if (args.overallCount !== undefined) {
      overallCount = args.overallCount
    } else if (this.s.overallCount !== undefined) {
      overallCount = this.s.overallCount
    }

    if (models === undefined || overallCount === undefined || this.p.noRecordsAvailableContent === undefined) return false
    if (models.length === 0 && overallCount === 0 && this.p.noRecordsAvailableContent) return true
  }

  /** @param {Record<string, any>} args */
  showNoRecordsFoundContent(args) {
    let models, overallCount

    if (args.models !== undefined) {
      models = args.models
    } else if (this.s.models !== undefined) {
      models = this.s.models
    }

    if (args.overallCount !== undefined) {
      overallCount = args.overallCount
    } else if (this.s.overallCount !== undefined) {
      overallCount = this.s.overallCount
    }

    if (models === undefined || this.p.noRecordsFoundContent === undefined) return false

    // Dont show noRecordsAvailableContent together with noRecordsAvailableContent
    if (models.length === 0 && overallCount === 0 && this.p.noRecordsAvailableContent) return false
    if (models.length === 0 && this.p.noRecordsFoundContent) return true
  }

  /** @returns {Promise<void>} */
  loadOverallCount = async () => {
    // Ignore late overall-count responses once a newer load cycle has started or the hook unmounted.
    const loadOverallCountGeneration = this.loadOverallCountGeneration + 1

    this.loadOverallCountGeneration = loadOverallCountGeneration

    const baseQuery = this.p.collection || this.p.modelClass.all()
    const overallCount = await baseQuery.count()

    if (loadOverallCountGeneration != this.loadOverallCountGeneration) return

    this.setState({
      overallCount,
      showNoRecordsAvailableContent: this.showNoRecordsAvailableContent({overallCount}),
      showNoRecordsFoundContent: this.showNoRecordsFoundContent({overallCount})
    })
  }

  /** @returns {{qParams: Record<string, any>, searchParams: string[]}} */
  loadQParams() {
    let qParamsToSet = Object.assign({}, this.p.defaultParams)
    const searchParams = []

    if (this.queryParams && this.queryQName() in this.queryParams) {
      qParamsToSet = JSON.parse(digg(this.queryParams, this.queryQName()))
    }

    if (this.queryParams?.[this.querySName()]) {
      for (const rawSearchParam of this.queryParams[this.querySName()]) {
        const parsedSearchParam = JSON.parse(rawSearchParam)

        searchParams.push(parsedSearchParam)
      }
    }

    this.setState({
      qParams: qParamsToSet,
      searchParams
    })

    return {
      qParams: qParamsToSet,
      searchParams
    }
  }

  /**
   * @param {object} [args]
   * @param {Record<string, any>} [args.qParams]
   * @param {string[]} [args.searchParams]
   * @returns {{qParams: Record<string, any>, searchParams: string[]}}
   */
  loadModelsArgs(args = {}) {
    return {
      qParams: args.qParams ?? this.s.qParams,
      searchParams: args.searchParams ?? this.s.searchParams
    }
  }

  /**
   * @param {object} [args]
   * @param {Record<string, any>} [args.qParams]
   * @param {string[]} [args.searchParams]
   * @returns {Promise<void>}
   */
  loadModels = async (args = {}) => {
    // Only the newest collection request is allowed to update state after navigation/filter changes.
    const loadModelsGeneration = this.loadModelsGeneration + 1
    const {qParams, searchParams} = this.loadModelsArgs(args)

    this.loadModelsGeneration = loadModelsGeneration
    let query = this.p.collection?.clone() || this.p.modelClass.ransack()

    if (this.p.pagination) {
      const page = this.queryParams?.[this.queryPageName()] || 1
      let per = this.queryParams?.[this.queryPerKey()] || 30

      if (per == "all") {
        per = 999_999_999
      } else {
        per = Number(per)
      }

      query.page(page).per(per)
    }

    if (this.p.groupBy) query = query.groupBy(...this.p.groupBy)

    query = query
      .ransack(qParams)
      .search(searchParams)
      .searchKey(this.queryQName())
      .pageKey(this.queryPageName())
      .perKey(this.queryPerKey())

    if (this.p.abilities) query.abilities(this.p.abilities)
    if (this.p.limit !== undefined) query.limit(this.p.limit)
    if (this.p.preloads) query.preload(this.p.preloads)
    if (this.p.ransack) query.ransack(this.p.ransack)
    if (this.p.select) query.select(this.p.select)
    if (this.p.selectColumns) query.selectColumns(this.p.selectColumns)

    let result

    if (this.p.queryMethod) {
      result = await this.p.queryMethod({query})
    } else {
      result = await query.result()
    }

    const models = result.models()

    if (loadModelsGeneration != this.loadModelsGeneration) return

    if (this.p.onModelsLoaded) {
      this.p.onModelsLoaded({
        models,
        qParams: this.s.qParams,
        query,
        result
      })
    }

    this.setState({
      models,
      query,
      result,
      showNoRecordsAvailableContent: this.showNoRecordsAvailableContent({models}),
      showNoRecordsFoundContent: this.showNoRecordsFoundContent({models})
    })
  }

  /** @param {{model: import("./base-model.js").default}} args */
  onModelDestroyed(args) {
    const destroyedModel = digg(args, "model")

    this.setState({
      models: this.s.models.filter((model) => model.id() != destroyedModel.id())
    })
  }

  /** @param {{model: import("./base-model.js").default}} args */
  onModelUpdated(args) {
    const updatedModel = digg(args, "model")
    const foundModel = this.s.models.find((model) => model.id() == updatedModel.id())

    if (foundModel) this.loadModelsDebounce()()
  }

  /** @returns {void} */
  onCreated() {
    this.loadModelsDebounce()()
  }

  /** @returns {void} */
  componentDidMount() {
    this.setState({readyToLoad: true})
  }

  /** @returns {void} */
  setup() {
    this.useStates({
      models: undefined,
      overallCount: undefined,
      qParams: {},
      query: undefined,
      readyToLoad: false,
      result: undefined,
      searchParams: undefined,
      showNoRecordsAvailableContent: false,
      showNoRecordsFoundContent: false
    })
    this.setInstance({queryParams: useQueryParams()})

    // Wait until componentDidMount has flipped readyToLoad so the first load runs after useShapeHook has marked the hook mounted.
    useEffect(
      () => {
        if (!this.s.readyToLoad) return
        if (this.p.ifCondition === undefined || this.p.ifCondition()) {
          const {qParams, searchParams} = this.loadQParams()

          this.loadModels({qParams, searchParams})
        }
      },
      [
        this.p.modelClass,
        this.p.ifCondition,
        this.queryName(),
        this.queryParams?.[this.queryQName()],
        this.queryParams?.[this.queryPageName()],
        this.queryParams?.[this.queryPerKey()],
        this.queryParams?.[this.querySName()],
        this.s.readyToLoad,
        this.p.collection
      ].concat(this.p.cacheKeys)
    )

    useEffect(() => {
      if (!this.s.readyToLoad) return
      if (this.p.noRecordsAvailableContent) {
        this.loadOverallCount()
      }
    }, [this.p.modelClass, this.s.readyToLoad])

    useCreatedEvent(this.p.modelClass, () => this.onCreated())

    // Invalidate any in-flight async responses so unmounted hooks cannot write stale state.
    useEffect(() => () => {
      this.loadModelsGeneration += 1
      this.loadOverallCountGeneration += 1
      this.loadModelsDebounce().clear?.()
    }, [])

    useEffect(() => {
      const connections = []

      if (this.s.models) {
        for (const model of this.s.models) {
          connections.push(ModelEvents.connectUpdated(model, (args) => this.onModelUpdated(args)))
          connections.push(ModelEvents.connectDestroyed(model, (args) => this.onModelDestroyed(args)))
        }
      }

      return () => {
        for (const connection of connections) {
          connection.unsubscribe()
        }
      }
    }, [this.modelIdsCacheString()])
  }
}

const useCollection = (props, cacheKeys = []) => {
  const {
    abilities,
    collection,
    defaultParams,
    groupBy,
    ifCondition,
    limit,
    modelClass,
    noRecordsAvailableContent = undefined,
    noRecordsFoundContent = undefined,
    onModelsLoaded,
    pagination = false,
    preloads = [],
    queryMethod,
    queryName,
    ransack,
    select = {},
    selectColumns,
    ...restProps
  } = props

  if (Object.keys(restProps).length > 0) {
    throw new Error(`Unknown props given to useCollection: ${Object.keys(restProps).join(", ")}`)
  }

  const shapeHook = useShapeHook(UseCollectionShapeHook, {
    abilities,
    cacheKeys,
    collection,
    defaultParams,
    groupBy,
    ifCondition,
    limit,
    modelClass,
    noRecordsAvailableContent,
    noRecordsFoundContent,
    onModelsLoaded,
    pagination,
    preloads,
    queryMethod,
    queryName,
    ransack,
    select,
    selectColumns
  })
  const result = /** @type {UseCollectionResult & Record<string, any>} */ (Object.assign({}, shapeHook.state))
  const modelVariableName = inflection.pluralize(inflection.camelize(shapeHook.p.modelClass.modelClassData().name, true))

  result.modelIdsCacheString = shapeHook.modelIdsCacheString()
  result.queryName = shapeHook.queryName()
  result.queryPerKey = shapeHook.queryPerKey()
  result.queryQName = shapeHook.queryQName()
  result.querySName = shapeHook.querySName()
  result.queryPageName = shapeHook.queryPageName()
  result[modelVariableName] = shapeHook.s.models

  return result
}

export default useCollection
