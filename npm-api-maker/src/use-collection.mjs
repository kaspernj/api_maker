import debounce from "debounce"
import {digg} from "diggerize"
import * as inflection from "inflection"
import ModelEvents from "./model-events.mjs"
import {useCallback, useEffect} from "react"
import useShape from "set-state-compare/src/use-shape.js"
import useQueryParams from "on-location-changed/src/use-query-params.js"

const useCollection = (
  {
    abilities,
    collection,
    defaultParams,
    groupBy = ["id"],
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
  },
  cacheKeys = []
) => {
  if (Object.keys(restProps).length > 0) {
    throw new Error(`Unknown props given to useCollection: ${Object.keys(restProps).join(", ")}`)
  }

  const s = useShape({
    abilities,
    collection,
    defaultParams,
    groupBy,
    limit,
    modelClass,
    noRecordsAvailableContent,
    noRecordsFoundContent,
    onModelsLoaded,
    pagination,
    preloads,
    queryMethod,
    ransack,
    select,
    selectColumns
  })

  s.meta.queryParams = useQueryParams()

  if (!queryName) queryName = digg(modelClass.modelClassData(), "collectionKey")

  const hasQParams = useCallback(() => {
    if (s.s.queryQName in s.m.queryParams) return true

    return false
  }, [])

  const qParams = useCallback(() => {
    if (hasQParams()) return JSON.parse(digg(s.m.queryParams, s.s.queryQName))

    return {}
  }, [])

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
    qParams: qParams()
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
    const baseQuery = s.p.collection || s.p.modelClass.all()
    const overallCount = await baseQuery.count()

    s.set({
      overallCount,
      showNoRecordsAvailableContent: showNoRecordsAvailableContent({overallCount}),
      showNoRecordsFoundContent: showNoRecordsFoundContent({overallCount})
    })
  }, [])

  const loadQParams = useCallback(() => {
    const qParamsToSet = hasQParams() ? qParams() : Object.assign({}, s.p.defaultParams)
    const searchParams = []

    if (s.m.queryParams[s.s.querySName]) {
      for (const rawSearchParam of s.m.queryParams[s.s.querySName]) {
        const parsedSearchParam = JSON.parse(rawSearchParam)

        searchParams.push(parsedSearchParam)
      }
    }

    s.set({
      qParams: qParamsToSet,
      searchParams
    })
  }, [])

  const loadModels = useCallback(async () => {
    let query = s.p.collection?.clone() || s.p.modelClass.ransack()

    if (s.p.pagination) {
      const page = s.m.queryParams[s.s.queryPageName] || 1
      let per = s.m.queryParams[s.s.queryPerKey] || 30

      if (per == "all") {
        per = 999_999_999
      } else {
        per = Number(per)
      }

      query.page(page).per(per)
    }

    if (s.p.groupBy) query = query.groupBy(...s.p.groupBy)

    query = query
      .ransack(s.s.qParams)
      .ransack(s.props.ransack)
      .search(s.s.searchParams)
      .searchKey(s.s.queryQName)
      .pageKey(s.s.queryPageName)
      .perKey(s.s.queryPerKey)
      .preload(s.p.preloads)
      .select(s.p.select)

    if (s.p.abilities) query = query.abilities(s.p.abilities)
    if (s.p.limit !== undefined) query = query.limit(s.p.limit)
    if (s.p.selectColumns) query = query.selectColumns(s.p.selectColumns)

    let result

    if (s.p.queryMethod) {
      result = await s.p.queryMethod({query})
    } else {
      result = await query.result()
    }

    const models = result.models()

    if (s.p.onModelsLoaded) {
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
  }, [])

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

    if (models === undefined || s.p.noRecordsFoundContent === undefined) return false

    // Dont show noRecordsAvailableContent together with noRecordsAvailableContent
    if (models.length === 0 && overallCount === 0 && s.p.noRecordsAvailableContent) return false
    if (models.length === 0 && s.p.noRecordsFoundContent) return true
  }, [])

  useEffect(
    () => {
      loadQParams()
      loadModels()
    },
    [
      s.m.queryParams[s.s.queryQName],
      s.m.queryParams[s.s.queryPageName],
      s.m.queryParams[s.s.queryPerKey],
      s.m.queryParams[s.s.querySName],
      collection
    ].concat(cacheKeys)
  )

  useEffect(() => {
    if (s.p.noRecordsAvailableContent) loadOverallCount()
  }, [])

  useEffect(() => {
    const connectCreated = ModelEvents.connectCreated(s.p.modelClass, loadModels)

    return () => {
      connectCreated.unsubscribe()
    }
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

  const result = Object.assign({}, s.state)
  const modelVariableName = inflection.pluralize(inflection.camelize(modelClass.modelClassData().name, true))

  result.modelIdsCacheString = modelIdsCacheString
  result[modelVariableName] = s.s.models

  return result
}

export default useCollection
