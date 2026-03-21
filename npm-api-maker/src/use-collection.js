/* eslint-disable no-unused-vars, no-use-before-define, prefer-object-spread, sort-imports */
import debounce from "debounce"
import {digg} from "diggerize"
import * as inflection from "inflection"
import ModelEvents from "./model-events.js"
import {useCallback, useEffect, useMemo, useRef} from "react"
import useCreatedEvent from "./use-created-event.js"
import useShape from "./use-shape.js"
import useQueryParams from "on-location-changed/build/use-query-params.js"

const emptyObject = {}

export const queryParamsOrEmpty = (queryParams) => queryParams || emptyObject

/**
 * @typedef {object} UseCollectionResult
 * @property {Array<import("./base-model.js").default>} models
 * @property {Array<number | string>} modelIdsCacheString
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
    queryName: initialQueryName,
    ransack,
    select = {},
    selectColumns,
    ...restProps
  } = props

  if (Object.keys(restProps).length > 0) {
    throw new Error(`Unknown props given to useCollection: ${Object.keys(restProps).join(", ")}`)
  }

  const s = useShape(props)
  const queryName = initialQueryName || digg(modelClass.modelClassData(), "collectionKey")
  const loadModelsGenerationRef = useRef(0)
  const loadOverallCountGenerationRef = useRef(0)

  s.meta.queryParams = useQueryParams()
  const queryParams = queryParamsOrEmpty(s.m.queryParams)

  const hasQParams = useCallback(() => {
    if (s.s.queryQName in queryParams) return true

    return false
  }, [queryParams, s.s.queryQName])

  const qParams = useCallback(() => {
    if (hasQParams()) return JSON.parse(digg(queryParams, s.s.queryQName))

    return {}
  }, [hasQParams, queryParams, s.s.queryQName])

  s.useStates({
    models: undefined,
    overallCount: undefined,
    query: undefined,
    queryName,
    queryPerKey: `${queryName}_per`,
    queryQName: `${queryName}_q`,
    querySName: `${queryName}_s`,
    queryPageName: `${queryName}_page`,
    result: undefined,
    searchParams: undefined,
    showNoRecordsAvailableContent: false,
    showNoRecordsFoundContent: false
  })
  s.useStates({
    qParams: () => qParams()
  })

  let modelIdsCacheString

  if (s.s.models === undefined) {
    modelIdsCacheString = "models-undefined"
  } else if (s.s.models.length === 0) {
    modelIdsCacheString = "no-models"
  } else {
    modelIdsCacheString = s.s.models.map((model) => model.cacheKey())?.join("---")
  }

  const loadOverallCount = useCallback(async () => {
    // Ignore late overall-count responses once a newer load cycle has started or the hook unmounted.
    const loadOverallCountGeneration = loadOverallCountGenerationRef.current + 1

    loadOverallCountGenerationRef.current = loadOverallCountGeneration

    const baseQuery = s.p.collection || s.p.modelClass.all()
    const overallCount = await baseQuery.count()

    if (loadOverallCountGeneration != loadOverallCountGenerationRef.current) return

    s.set({
      overallCount,
      showNoRecordsAvailableContent: showNoRecordsAvailableContent({overallCount}),
      showNoRecordsFoundContent: showNoRecordsFoundContent({overallCount})
    })
  }, [])

  const loadQParams = useCallback(() => {
    const qParamsToSet = hasQParams() ? qParams() : Object.assign({}, s.props.defaultParams)
    const searchParams = []

    if (queryParams[s.s.querySName]) {
      for (const rawSearchParam of queryParams[s.s.querySName]) {
        const parsedSearchParam = JSON.parse(rawSearchParam)

        searchParams.push(parsedSearchParam)
      }
    }

    s.set({
      qParams: qParamsToSet,
      searchParams
    })
  }, [hasQParams, qParams, queryParams, s.props.defaultParams, s.s.querySName])

  const loadModels = useCallback(async () => {
    // Only the newest collection request is allowed to update state after navigation/filter changes.
    const loadModelsGeneration = loadModelsGenerationRef.current + 1

    loadModelsGenerationRef.current = loadModelsGeneration
    let query = s.props.collection?.clone() || s.p.modelClass.ransack()

    if (s.props.pagination) {
      const page = queryParams[s.s.queryPageName] || 1
      let per = queryParams[s.s.queryPerKey] || 30

      if (per == "all") {
        per = 999_999_999
      } else {
        per = Number(per)
      }

      query.page(page).per(per)
    }

    if (s.props.groupBy) query = query.groupBy(...s.p.groupBy)

    query = query
      .ransack(s.s.qParams)
      .search(s.s.searchParams)
      .searchKey(s.s.queryQName)
      .pageKey(s.s.queryPageName)
      .perKey(s.s.queryPerKey)

    if (s.props.abilities) query.abilities(s.p.abilities)
    if (s.props.limit !== undefined) query.limit(s.p.limit)
    if (s.props.preloads) query.preload(s.p.preloads)
    if (s.props.ransack) query.ransack(s.props.ransack)
    if (s.props.select) query.select(s.p.select)
    if (s.props.selectColumns) query.selectColumns(s.p.selectColumns)

    let result

    if (s.props.queryMethod) {
      result = await s.p.queryMethod({query})
    } else {
      result = await query.result()
    }

    const models = result.models()

    if (loadModelsGeneration != loadModelsGenerationRef.current) return

    if (s.props.onModelsLoaded) {
      s.p.onModelsLoaded({
        models,
        qParams: s.s.qParams,
        query,
        result
      })
    }

    s.set({
      models: result.models(),
      query,
      result,
      showNoRecordsAvailableContent: showNoRecordsAvailableContent({models}),
      showNoRecordsFoundContent: showNoRecordsFoundContent({models})
    })
  }, [queryParams])

  const loadModelsDebounce = useCallback(debounce(loadModels), [])
  const onModelDestroyed = useCallback((args) => {
    s.set({
      models: s.s.models.filter((model) => model.id() != args.model.id())
    })
  }, [])

  const onModelUpdated = useCallback((args) => {
    const updatedModel = digg(args, "model")
    const foundModel = s.s.models.find((model) => model.id() == updatedModel.id())

    if (foundModel) loadModelsDebounce()
  }, [])

  const showNoRecordsAvailableContent = useCallback((args) => {
    let models, overallCount

    if (args.models !== undefined) {
      models = args.models
    } else if (s.s.models !== undefined) {
      models = s.s.models
    }

    if (args.overallCount !== undefined) {
      overallCount = args.overallCount
    } else if (s.s.overallCount !== undefined) {
      overallCount = s.s.overallCount
    }

    if (models === undefined || overallCount === undefined || s.p.noRecordsAvailableContent === undefined) return false
    if (models.length === 0 && overallCount === 0 && s.p.noRecordsAvailableContent) return true
  }, [])

  const showNoRecordsFoundContent = useCallback((args) => {
    let models, overallCount

    if (args.models !== undefined) {
      models = args.models
    } else if (s.s.models !== undefined) {
      models = s.s.models
    }

    if (args.overallCount !== undefined) {
      overallCount = args.overallCount
    } else if (s.s.overallCount !== undefined) {
      overallCount = s.s.overallCount
    }

    if (models === undefined || s.props.noRecordsFoundContent === undefined) return false

    // Dont show noRecordsAvailableContent together with noRecordsAvailableContent
    if (models.length === 0 && overallCount === 0 && s.props.noRecordsAvailableContent) return false
    if (models.length === 0 && s.props.noRecordsFoundContent) return true
  }, [])

  const onCreated = useCallback(() => {
    loadModelsDebounce()
  }, [])

  // Collection loading has to wait until mount so fast responses cannot get stranded in ShapeHook's pre-mount queue.
  useEffect(
    () => {
      if (!("ifCondition" in s.props) || s.props.ifCondition) {
        loadQParams()
        loadModels()
      }
    },
    [
      modelClass,
      s.props.ifCondition,
      s.s.queryName,
      queryParams[s.s.queryQName],
      queryParams[s.s.queryPageName],
      queryParams[s.s.queryPerKey],
      queryParams[s.s.querySName],
      collection
    ].concat(cacheKeys)
  )

  useEffect(() => {
    if (s.props.noRecordsAvailableContent) {
      loadOverallCount()
    }
  }, [modelClass])

  useCreatedEvent(s.p.modelClass, onCreated)

  // Invalidate any in-flight async responses so unmounted hooks cannot write stale state.
  useEffect(() => () => {
    loadModelsGenerationRef.current += 1
    loadOverallCountGenerationRef.current += 1
  }, [])

  useEffect(() => {
    const connections = []

    if (s.s.models) {
      for(const model of s.s.models) {
        connections.push(ModelEvents.connectUpdated(model, onModelUpdated))
        connections.push(ModelEvents.connectDestroyed(model, onModelDestroyed))
      }
    }

    return () => {
      for(const connection of connections) {
        connection.unsubscribe()
      }
    }
  }, [modelIdsCacheString])

  const result = /** @type {UseCollectionResult & Record<string, any>} */ (Object.assign({}, s.state))
  const modelVariableName = inflection.pluralize(inflection.camelize(modelClass.modelClassData().name, true))

  result.modelIdsCacheString = modelIdsCacheString
  result[modelVariableName] = s.s.models

  return result
}

export default useCollection
