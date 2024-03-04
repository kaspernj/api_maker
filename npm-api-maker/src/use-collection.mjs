import Collection from "./collection.mjs"
import debounce from "debounce"
import {digg} from "diggerize"
import * as inflection from "inflection"
import ModelEvents from "./model-events.mjs"
import PropTypes from "prop-types"
import PropTypesExact from "prop-types-exact"
import {useCallback, useEffect} from "react"
import useShape from "set-state-compare/src/use-shape.js"
import useQueryParams from "on-location-changed/src/use-query-params.js"

const useCollection = (
  {
    abilities,
    collection,
    defaultParams,
    groupBy = ["id"],
    modelClass,
    noRecordsAvailableContent = undefined,
    noRecordsFoundContent = undefined,
    onModelsLoaded,
    pagination = false,
    preloads = [],
    queryMethod,
    queryName,
    select = {},
    selectColumns
  },
  cacheKeys = []
) => {
  const s = useShape({
    abilities,
    collection,
    defaultParams,
    groupBy,
    modelClass,
    noRecordsAvailableContent,
    noRecordsFoundContent,
    onModelsLoaded,
    pagination,
    preloads,
    queryMethod,
    select,
    selectColumns
  })

  if (!queryName) queryName = digg(modelClass.modelClassData(), "collectionKey")

  const setModels = s.useState("models")
  const setOverallCount = s.useState("overallCount")
  const setQuery = s.useState("query")
  const setQueryName = s.useState("queryName", queryName)
  const setQueryPerKey = s.useState("queryPerKey", `${s.s.queryName}_per`)
  const setQueryQName = s.useState("queryQName", `${s.s.queryName}_q`)
  const setQuerySName = s.useState("querySName", `${s.s.queryName}_s`)
  const setQueryPageName = s.useState("queryPageName", `${s.s.queryName}_page`)
  const setQParams = s.useState("qParams")
  const setResult = s.useState("result")
  const setSearchParams = s.useState("searchParams")
  const setShowNoRecordsAvailableContent = s.useState("showNoRecordsAvailableContent", false)
  const setShowNoRecordsFoundContent = s.useState("showNoRecordsFoundContent", false)
  const queryParams = useQueryParams()
  const modelIds = s.s.models?.map((model) => model.id())

  let modelIdsCacheString

  if (s.s.models === undefined) {
    modelIdsCacheString = "models-undefined"
  } else if (s.s.models.length === 0) {
    modelIdsCacheString = "no-models"
  } else {
    modelIdsCacheString = modelIds?.join("---")
  }

  s.updateMeta({queryParams})

  const loadOverallCount = useCallback(async () => {
    const baseQuery = s.p.collection || s.p.modelClass.all()
    const overallCount = await baseQuery.count()

    setOverallCount(overallCount)
    setShowNoRecordsAvailableContent(showNoRecordsAvailableContent({overallCount}))
    setShowNoRecordsFoundContent(showNoRecordsFoundContent({overallCount}))
  }, [])

  const hasQParams = useCallback(() => {
    if (s.s.queryQName in s.m.queryParams) return true

    return false
  }, [])

  const qParams = useCallback(() => {
    if (hasQParams()) return JSON.parse(digg(s.m.queryParams, s.s.queryQName))

    return {}
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

    setQParams(qParamsToSet)
    setSearchParams(searchParams)
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
      .search(s.s.searchParams)
      .searchKey(s.s.queryQName)
      .pageKey(s.s.queryPageName)
      .perKey(s.s.queryPerKey)
      .preload(s.p.preloads)
      .select(s.p.select)

    if (s.p.abilities) query = query.abilities(s.p.abilities)
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

    setQuery(query)
    setResult(result)
    setModels(result.models())
    setShowNoRecordsAvailableContent(showNoRecordsAvailableContent({models}))
    setShowNoRecordsFoundContent(showNoRecordsFoundContent({models}))
  }, [])

  const loadModelsDebounce = useCallback(debounce(loadModels), [])
  const onModelDestroyed = useCallback((args) => {
    setModels(s.s.models.filter((model) => model.id() != args.model.id()))
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
    [queryParams[s.s.queryQName], queryParams[s.s.queryPageName], queryParams[s.s.queryPerKey], queryParams[s.s.querySName], collection].concat(cacheKeys)
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

useCollection.propTypes = PropTypesExact({
  abilities: PropTypes.object,
  collection: PropTypes.instanceOf(Collection),
  defaultParams: PropTypes.object,
  groupBy: PropTypes.array,
  modelClass: PropTypes.func.isRequired,
  noRecordsAvailableContent: PropTypes.func,
  noRecordsFoundContent: PropTypes.func,
  onModelsLoaded: PropTypes.func,
  pagination: PropTypes.bool.isRequired,
  preloads: PropTypes.array.isRequired,
  queryMethod: PropTypes.func,
  queryName: PropTypes.string,
  select: PropTypes.object,
  selectColumns: PropTypes.object
})

export default useCollection
