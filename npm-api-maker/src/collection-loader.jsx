const Collection = require("@kaspernj/api-maker/src/collection")
const {debounce} = require("debounce")
const {digg, digs} = require("diggerize")
const EventCreated = require("@kaspernj/api-maker/src/event-created").default
const instanceOfClassName = require("@kaspernj/api-maker/src/instance-of-class-name")
const {LocationChanged} = require("on-location-changed/location-changed-component")
const Params = require("@kaspernj/api-maker/src/params")
const PropTypes = require("prop-types")
const React = require("react")

export default class CollectionLoader extends React.PureComponent {
  static defaultProps = {
    destroyEnabled: true,
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

  shape = digg(this, "props", "component").shape || digg(this, "props", "component").state

  constructor (props) {
    super(props)

    let queryName = props.queryName

    if (!queryName) {
      queryName = digg(props.modelClass.modelClassData(), "collectionKey")
    }

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

    if (this.props.noRecordsAvailableContent) {
      this.loadOverallCount()
    }
  }

  async loadOverallCount () {
    const baseQuery = this.props.collection || this.props.modelClass.all()
    const overallCount = await baseQuery.count()

    this.shape.set({overallCount})
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

    console.log({collection})

    let query = collection?.clone() || modelClass

    if (groupBy) query = query.groupBy(groupBy)

    console.log({query})

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

    console.log("CollectionLoader", {abilities, qParams, query, selectColumns, models})


    if (onModelsLoaded) {
      onModelsLoaded({
        models,
        qParams,
        query,
        result,
        showNoRecordsAvailableContent: this.showNoRecordsAvailableContent(),
        showNoRecordsFoundContent: this.showNoRecordsFoundContent()
      })
    }

    this.shape.set({query, result, models: result.models()})
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

    if (foundModel) {
      this.loadModelsDebounce()
    }
  }

  onLocationChanged = () => {
    const {queryQName} = digs(this.shape, "queryQName")
    const params = Params.parse()
    const qParams = Object.assign({}, this.props.defaultParams, params[queryQName])

    this.shape.set({qParams})
    this.loadModels()
  }

  showNoRecordsAvailableContent () {
    const {noRecordsAvailableContent} = this.props
    const {models, overallCount} = digs(this.shape, "models", "overallCount")

    if (models === undefined || overallCount === undefined || noRecordsAvailableContent === undefined) return
    if (models.length === 0 && overallCount === 0 && noRecordsAvailableContent) return true
  }

  showNoRecordsFoundContent () {
    const {noRecordsAvailableContent, noRecordsFoundContent} = this.props
    const {models, overallCount} = digs(this.shape, "models", "overallCount")

    if (models === undefined || noRecordsFoundContent === undefined) return

    // Dont show noRecordsAvailableContent together with noRecordsAvailableContent
    if (models.length === 0 && overallCount === 0 && noRecordsAvailableContent) return

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
            <EventDestroyed model={model} onDestroyed={this.onModelDestroyed} />
            <EventUpdated model={model} onUpdated={this.onModelUpdated} />
          </React.Fragment>
        )}
      </>
    )
  }
}
