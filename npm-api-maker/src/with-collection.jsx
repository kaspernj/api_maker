import {debounce} from "debounce"
import {digg, digs} from "diggerize"
import EventCreated from "./event-created"
import EventDestroyed from "./event-destroyed"
import EventUpdated from "./event-updated"
import React from "react"
import Shape from "set-state-compare/src/shape"
import withQueryParams from "on-location-changed/src/with-query-params"

export default (WrappedComponent, withCollectionArgs) => withQueryParams(class ApiMakerWithCollection extends React.PureComponent {
  constructor (props) {
    super(props)

    let queryName = withCollectionArgs.queryName

    if (!queryName) queryName = digg(withCollectionArgs.modelClass.modelClassData(), "collectionKey")

    this.shape = new Shape(this, {
      models: undefined,
      overallCount: undefined,
      query: undefined,
      queryName,
      queryPerKey: `${queryName}_per`,
      queryQName: `${queryName}_q`,
      querySName: `${queryName}_s`,
      queryPageName: `${queryName}_page`,
      qParams: undefined,
      result: undefined,
      searchParams: undefined,
      showNoRecordsAvailableContent: false,
      showNoRecordsFoundContent: false
    })
  }

  componentDidMount () {
    this.loadQParams()
    this.loadModels()

    const {noRecordsAvailableContent} = digs(withCollectionArgs)

    if (noRecordsAvailableContent) this.loadOverallCount()
  }

  componentDidUpdate(prevProps) {
    const {queryPageName, queryPerKey, queryQName, querySName} = digs(this.shape, "queryPageName", "queryPerKey", "queryQName", "querySName")
    let changed = false

    // Only load models again if certain things in the URL changes
    if (prevProps.queryParams[queryQName] != this.props.queryParams[queryQName]) {
      changed = true
    } else if (prevProps.queryParams[queryPageName] != this.props.queryParams[queryPageName]) {
      changed = true
    } else if (prevProps.queryParams[queryPerKey] != this.props.queryParams[queryPerKey]) {
      changed = true
    } else if (prevProps.queryParams[querySName] != this.props.queryParams[querySName]) {
      changed = true
    }

    if (changed) {
      this.loadQParams()
      this.loadModels()
    }
  }

  async loadOverallCount () {
    const baseQuery = withCollectionArgs.collection || withCollectionArgs.modelClass.all()
    const overallCount = await baseQuery.count()

    this.shape.set({
      overallCount,
      showNoRecordsAvailableContent: this.showNoRecordsAvailableContent({overallCount}),
      showNoRecordsFoundContent: this.showNoRecordsFoundContent({overallCount})
    })
  }

  hasQParams() {
    const {queryParams} = digs(this.props, "queryParams")
    const {queryQName} = digs(this.shape, "queryQName")

    if (queryQName in queryParams) return true

    return false
  }

  qParams() {
    const {queryParams} = digs(this.props, "queryParams")
    const {queryQName} = digs(this.shape, "queryQName")

    if (this.hasQParams()) return JSON.parse(digg(queryParams, queryQName))

    return {}
  }

  loadQParams () {
    const {queryParams} = digs(this.props, "queryParams")
    const {querySName} = digs(this.shape, "querySName")
    const qParams = this.hasQParams() ? this.qParams() : Object.assign({}, withCollectionArgs.defaultParams)
    const searchParams = []

    if (queryParams[querySName]) {
      for (const rawSearchParam of queryParams[querySName]) {
        const parsedSearchParam = JSON.parse(rawSearchParam)

        searchParams.push(parsedSearchParam)
      }
    }

    this.shape.set({qParams, searchParams})
  }

  loadModels = async () => {
    const {queryParams} = digs(this.props, "queryParams")
    const {abilities, collection, groupBy, modelClass, onModelsLoaded, preloads, select, selectColumns} = withCollectionArgs
    const {
      qParams,
      queryPageName,
      queryPerKey,
      queryQName,
      searchParams
    } = digs(
      this.shape,
      "qParams",
      "queryPageName",
      "queryPerKey",
      "queryQName",
      "searchParams"
    )
    const page = queryParams[queryPageName] || 1
    let per = queryParams[queryPerKey] || 30

    if (per == "all") {
      per = 999_999_999
    } else {
      per = Number(per)
    }

    let query = collection?.clone() || modelClass.ransack()

    if (groupBy) query = query.groupBy(...groupBy)

    query = query
      .ransack(qParams)
      .search(searchParams)
      .searchKey(queryQName)
      .page(page)
      .pageKey(queryPageName)
      .per(per)
      .perKey(queryPerKey)
      .preload(preloads)
      .select(select)

    if (abilities) query = query.abilities(abilities)
    if (selectColumns) query = query.selectColumns(selectColumns)

    const result = await query.result()
    const models = result.models()

    if (onModelsLoaded) {
      onModelsLoaded({
        models,
        qParams,
        query,
        result
      })
    }

    this.shape.set({
      query,
      result,
      models: result.models(),
      showNoRecordsAvailableContent: this.showNoRecordsAvailableContent({models}),
      showNoRecordsFoundContent: this.showNoRecordsFoundContent({models})
    })
  }

  loadModelsDebounce = debounce(digg(this, "loadModels"))
  onModelCreated = digg(this, "loadModels")

  onModelDestroyed = ({destroyedModel}) => {
    const {models} = digs(this.shape, "models")

    this.shape.set({
      models: models.filter((model) => model.id() != destroyedModel.id())
    })
  }

  onModelUpdated = ({model: updatedModel}) => {
    const {models} = digs(this.shape, "models")
    const foundModel = models.find((model) => model.id() == updatedModel.id())

    if (foundModel) this.loadModelsDebounce()
  }

  showNoRecordsAvailableContent (args) {
    const {noRecordsAvailableContent} = withCollectionArgs
    let models, overallCount

    if (args.models !== undefined) {
      models = args.models
    } else if (this.shape.models !== undefined) {
      models = this.shape.models
    }

    if (args.overallCount !== undefined) {
      overallCount = args.overallCount
    } else if (this.shape.overallCount !== undefined) {
      overallCount = this.shape.overallCount
    }

    if (models === undefined || overallCount === undefined || noRecordsAvailableContent === undefined) return false
    if (models.length === 0 && overallCount === 0 && noRecordsAvailableContent) return true
  }

  showNoRecordsFoundContent (args) {
    const {noRecordsAvailableContent, noRecordsFoundContent} = withCollectionArgs
    let models, overallCount

    if (args.models !== undefined) {
      models = args.models
    } else if (this.shape.models !== undefined) {
      models = this.shape.models
    }

    if (args.overallCount !== undefined) {
      overallCount = args.overallCount
    } else if (this.shape.overallCount !== undefined) {
      overallCount = this.shape.overallCount
    }

    if (models === undefined || noRecordsFoundContent === undefined) return false

    // Dont show noRecordsAvailableContent together with noRecordsAvailableContent
    if (models.length === 0 && overallCount === 0 && noRecordsAvailableContent) return false
    if (models.length === 0 && noRecordsFoundContent) return true
  }

  render() {
    const {modelClass} = digs(withCollectionArgs, "modelClass")
    const {onModelCreated, onModelDestroyed, onModelUpdated} = digs(this, "onModelCreated", "onModelDestroyed", "onModelUpdated")
    const {models} = digs(this.shape, "models")
    const modelsArgName = inflection.camelize(digg(withCollectionArgs.modelClass.modelClassData(), "pluralName"), true)
    const forwardArgs = {}

    forwardArgs[modelsArgName] = models

    return (
      <>
        <EventCreated modelClass={modelClass} onCreated={onModelCreated} />
        {models && models.map((model) =>
          <React.Fragment key={model.id()}>
            <EventDestroyed model={model} onDestroyed={onModelDestroyed} />
            <EventUpdated model={model} onUpdated={onModelUpdated} />
          </React.Fragment>
        )}
        <WrappedComponent {...forwardArgs} {...this.props} />
      </>
    )
  }
})
