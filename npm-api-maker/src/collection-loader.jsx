const Collection = require("@kaspernj/api-maker/src/collection")
const {debounce} = require("debounce")
const {digg, digs} = require("diggerize")
const EventCreated = require("@kaspernj/api-maker/src/event-created").default
const EventDestroyed = require("@kaspernj/api-maker/src/event-destroyed").default
const EventUpdated = require("@kaspernj/api-maker/src/event-updated").default
const instanceOfClassName = require("@kaspernj/api-maker/src/instance-of-class-name")
const Params = require("@kaspernj/api-maker/src/params")
const PropTypes = require("prop-types")
const React = require("react")

import {LocationChanged} from "on-location-changed/src/location-changed-component"

export default class CollectionLoader extends React.PureComponent {
  static defaultProps = {
    destroyEnabled: true,
    noRecordsAvailableContent: undefined,
    noRecordsFoundContent: undefined,
    preloads: [],
    select: {}
  }

  static propTypes = {
    abilities: PropTypes.object,
    appHistory: PropTypes.object,
    className: PropTypes.string,
    collection: PropTypes.oneOfType([
      instanceOfClassName("ApiMakerCollection"),
      PropTypes.instanceOf(Collection)
    ]),
    component: PropTypes.object,
    defaultParams: PropTypes.object,
    groupBy: PropTypes.array,
    modelClass: PropTypes.func.isRequired,
    noRecordsAvailableContent: PropTypes.func,
    noRecordsFoundContent: PropTypes.func,
    onModelsLoaded: PropTypes.func,
    paginateContent: PropTypes.func,
    preloads: PropTypes.array.isRequired,
    queryName: PropTypes.string,
    select: PropTypes.object,
    selectColumns: PropTypes.object
  }

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
      queryQName: `${queryName}_q`,
      queryPageName: `${queryName}_page`,
      qParams: undefined,
      result: undefined,
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

  async loadOverallCount () {
    const baseQuery = this.props.collection || this.props.modelClass.all()
    const overallCount = await baseQuery.count()

    this.shape.set({
      overallCount,
      showNoRecordsAvailableContent: this.showNoRecordsAvailableContent({overallCount}),
      showNoRecordsFoundContent: this.showNoRecordsFoundContent({overallCount})
    })
  }

  loadQParams () {
    const {queryQName} = digs(this.shape, "queryQName")
    const params = Params.parse()
    const qParams = Object.assign({}, this.props.defaultParams, params[queryQName])

    this.shape.set({qParams})
  }

  loadModelsDebounce = debounce(this.loadModels)

  loadModels = async () => {
    const params = Params.parse()
    const {abilities, collection, groupBy, modelClass, onModelsLoaded, preloads, select, selectColumns} = this.props
    const {qParams, queryPageName, queryQName} = digs(this.shape, "qParams", "queryPageName", "queryQName")

    let query = collection?.clone() || modelClass

    if (groupBy) query = query.groupBy(groupBy)

    query = query
      .ransack(qParams)
      .searchKey(queryQName)
      .page(params[queryPageName])
      .pageKey(queryPageName)
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

  onModelCreated = () => this.loadModels()

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

  onLocationChanged = () => {
    const {queryQName} = digs(this.shape, "queryQName")
    const params = Params.parse()
    const qParams = Object.assign({}, this.props.defaultParams, params[queryQName])

    this.shape.set({qParams})
    this.loadModels()
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
        <LocationChanged onChanged={digg(this, "onLocationChanged")} />
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
