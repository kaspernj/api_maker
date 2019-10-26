import Collection from "api-maker/collection"
import EventCreated from "api-maker/event-created"
import EventDestroyed from "api-maker/event-destroyed"
import Paginate from "api-maker/paginate"
import Params from "api-maker/params"

const inflection = require("inflection")

export default class LiveTable extends React.Component {
  static defaultProps = {
    preloads: [],
    select: {}
  }

  static propTypes = PropTypesExact({
    className: PropTypes.string,
    collection: PropTypes.instanceOf(Collection),
    columnsContent: PropTypes.func.isRequired,
    defaultParams: PropTypes.object,
    destroyMessage: PropTypes.string,
    filterContent: PropTypes.func,
    filterSubmitLabel: PropTypes.node,
    headersContent: PropTypes.func.isRequired,
    modelClass: PropTypes.func.isRequired,
    preloads: PropTypes.array.isRequired,
    queryName: PropTypes.string.isRequired,
    select: PropTypes.object
  })

  constructor(props) {
    super(props)
    this.state = {
      currentHref: location.href,
      queryQName: `${this.props.queryName}_q`,
      queryPageName: `${this.props.queryName}_page`
    }
  }

  componentDidMount() {
    this.loadQParams().then(() => this.loadModels())
  }

  componentDidUpdate() {
    if (this.state.currentHref != location.href) {
      var { queryQName } = this.state
      var params = Params.parse()
      var qParams = params[queryQName] || {}
      Params.setCachedParams(queryQName, qParams)
      this.setState({currentHref: location.href, qParams}, () => this.loadModels())
    }
  }

  async loadQParams() {
    var { queryQName } = this.state
    var qParams = await Params.getCachedParams(queryQName, {default: this.props.defaultParams || {}})
    return this.setState({qParams})
  }

  async loadModels() {
    var params = Params.parse()
    var { modelClass, preloads, select } = this.props
    var { qParams, queryPageName, queryQName } = this.state
    var query

    if (this.props.collection) {
      query = this.props.collection
    } else {
      query = modelClass
    }

    query = query
      .ransack(qParams)
      .searchKey(queryQName)
      .page(params[queryPageName])
      .pageKey(queryPageName)
      .preload(preloads)
      .select(select)

    var result = await query.result()

    this.setState({query, result, models: result.models()})
  }

  render() {
    var { qParams, query, result, models } = this.state

    return (
      <div className={this.className()}>
        {qParams && query && result && models && this.content()}
      </div>
    )
  }

  content() {
    var { filterContent, filterSubmitLabel, modelClass } = this.props
    var { qParams, query, result, models } = this.state

    return (
      <div className="content-container">
        <EventCreated modelClass={modelClass} onCreated={() => this.onModelCreated()} />

        {filterContent &&
          <Card className="mb-4">
            <form onSubmit={(e) => this.onFilterFormSubmit(e)} ref="filterForm">
              {filterContent({qParams})}
              <input className="btn btn-primary" label={filterSubmitLabel} type="submit" />
            </form>
          </Card>
        }

        {models.map(model =>
          <EventDestroyed key={`event-destroyed-${model.cacheKey()}`} model={model} onDestroyed={(args) => this.onModelDestroyed(args)} />
        )}

        <Card className="mb-4" striped table>
          <thead>
            <tr>
              {this.props.headersContent({query})}
            </tr>
          </thead>
          <tbody>
            {models.map(model =>
              <tr className={`${inflection.singularize(modelClass.modelClassData().collectionName)}-row`} data-model-id={model.id()} key={model.cacheKey()}>
                {this.props.columnsContent({model})}
              </tr>
            )}
          </tbody>
        </Card>

        <Paginate result={result} />
      </div>
    )
  }

  className() {
    var classNames = ["component-api-maker-live-table"]

    if (this.props.className)
      classNames.push(this.props.className)

    return classNames.join(" ")
  }

  onFilterFormSubmit(e) {
    e.preventDefault()

    var qParams = Params.serializeForm(this.refs.filterForm)
    var { queryQName } = this.state

    var changeParamsParams = {}
    changeParamsParams[queryQName] = qParams

    Params.changeParams(changeParamsParams)
    Params.setCachedParams(queryQName, qParams)

    this.setState({currentHref: location.href, qParams}, () => this.loadModels())
  }

  onModelCreated() {
    this.loadModels()
  }

  onModelDestroyed(args) {
    this.setState({
      models: this.state.models.filter(model => model.id() != args.model.id())
    })
  }
}
