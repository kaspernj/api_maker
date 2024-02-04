import Collection from "./collection"
import debounce from "debounce"
import {digg, digs} from "diggerize"
import EventCreated from "./event-created"
import EventDestroyed from "./event-destroyed"
import EventUpdated from "./event-updated"
import PropTypes from "prop-types"
import PropTypesExact from "prop-types-exact"
import React from "react"
import withQueryParams from "on-location-changed/src/with-query-params"

class CollectionLoader extends React.PureComponent {
  static defaultProps = {
    destroyEnabled: true,
    groupBy: ["id"],
    noRecordsAvailableContent: undefined,
    noRecordsFoundContent: undefined,
    pagination: false,
    preloads: [],
    select: {}
  }

  static propTypes = PropTypesExact({
    abilities: PropTypes.object,
    appHistory: PropTypes.object,
    className: PropTypes.string,
    collection: PropTypes.instanceOf(Collection),
    component: PropTypes.object,
    defaultParams: PropTypes.object,
    destroyEnabled: PropTypes.bool.isRequired,
    groupBy: PropTypes.array,
    modelClass: PropTypes.func.isRequired,
    noRecordsAvailableContent: PropTypes.func,
    noRecordsFoundContent: PropTypes.func,
    onModelsLoaded: PropTypes.func,
    pagination: PropTypes.bool.isRequired,
    paginateContent: PropTypes.func,
    preloads: PropTypes.array.isRequired,
    queryMethod: PropTypes.func,
    queryName: PropTypes.string,
    queryParams: PropTypes.object,
    select: PropTypes.object,
    selectColumns: PropTypes.object
  })

  shape = digg(this, "props", "component", "shape")

  constructor (props) {
    super(props)

    let queryName = props.queryName

    if (!queryName) queryName = digg(props.modelClass.modelClassData(), "collectionKey")

    this.shape.set({
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

    const {noRecordsAvailableContent} = digs(this.props, "noRecordsAvailableContent")

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
    } else if (prevProps.collection != this.props.collection) {
      changed = true
    }

    if (changed) {
      this.loadQParams()
      this.loadModels()
    }
  }

  async loadOverallCount () {
    const baseQuery = this.props.collection || this.props.modelClass.all()
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
    const qParams = this.hasQParams() ? this.qParams() : Object.assign({}, this.props.defaultParams)
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
    const {pagination, queryParams} = digs(this.props, "pagination", "queryParams")
    const {abilities, collection, groupBy, modelClass, onModelsLoaded, preloads, queryMethod, select, selectColumns} = this.props
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

    let query = collection?.clone() || modelClass.ransack()

    if (pagination) {
      const page = queryParams[queryPageName] || 1
      let per = queryParams[queryPerKey] || 30

      if (per == "all") {
        per = 999_999_999
      } else {
        per = Number(per)
      }

      query.page(page).per(per)
    }

    if (groupBy) query = query.groupBy(...groupBy)

    query = query
      .ransack(qParams)
      .search(searchParams)
      .searchKey(queryQName)
      .pageKey(queryPageName)
      .perKey(queryPerKey)
      .preload(preloads)
      .select(select)

    if (abilities) query = query.abilities(abilities)
    if (selectColumns) query = query.selectColumns(selectColumns)

    let result

    if (queryMethod) {
      result = await queryMethod({query})
    } else {
      result = await query.result()
    }

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

  onModelDestroyed = (args) => {
    const {models} = digs(this.shape, "models")

    this.shape.set({
      models: models.filter((model) => model.id() != args.model.id())
    })
  }

  onModelUpdated = (args) => {
    const {models} = digs(this.shape, "models")
    const updatedModel = digg(args, "model")
    const foundModel = models.find((model) => model.id() == updatedModel.id())

    if (foundModel) this.loadModelsDebounce()
  }

  showNoRecordsAvailableContent (args) {
    const {noRecordsAvailableContent} = digs(this.props, "noRecordsAvailableContent")
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
    const {noRecordsAvailableContent, noRecordsFoundContent} = digs(this.props, "noRecordsAvailableContent", "noRecordsFoundContent")
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
    const {modelClass} = digs(this.props, "modelClass")
    const {models} = digs(this.shape, "models")

    return (
      <>
        <EventCreated modelClass={modelClass} onCreated={digg(this, "onModelCreated")} />
        {models && models.map((model) =>
          <React.Fragment key={model.id()}>
            <EventDestroyed model={model} onDestroyed={digg(this, "onModelDestroyed")} />
            <EventUpdated model={model} onUpdated={digg(this, "onModelUpdated")} />
          </React.Fragment>
        )}
      </>
    )
  }
}

export default withQueryParams(CollectionLoader)
