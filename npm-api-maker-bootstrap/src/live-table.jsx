import { EventCreated, EventDestroyed, Params } from "@kaspernj/api-maker"
import { Paginate } from "@kaspernj/api-maker-bootstrap"
import Collection from "api-maker/collection"
import PropTypes from "prop-types"
import PropTypesExact from "prop-types-exact"
import React from "react"

const inflection = require("inflection")

export default class ApiMakerBootstrapLiveTable extends React.Component {
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
      const { queryQName } = this.state
      const params = Params.parse()
      const qParams = params[queryQName] || {}
      Params.setCachedParams(queryQName, qParams)
      this.setState({currentHref: location.href, qParams}, () => this.loadModels())
    }
  }

  async loadQParams() {
    const { queryQName } = this.state
    const params = Params.parse()
    const qParams = params[queryQName] || this.props.defaultParams || {}
    return this.setState({qParams})
  }

  async loadModels() {
    const params = Params.parse()
    const { modelClass, preloads, select } = this.props
    const { qParams, queryPageName, queryQName } = this.state
    let query

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

      const result = await query.result()

    this.setState({query, result, models: result.models()})
  }

  render() {
    const { qParams, query, result, models } = this.state

    return (
      <div className={this.className()}>
        {qParams && query && result && models && this.content()}
      </div>
    )
  }

  content() {
    const { filterContent, filterSubmitLabel, modelClass } = this.props
    const { qParams, query, result, models } = this.state

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

        <Card className="mb-4" table>
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
    const classNames = ["component-api-maker-live-table"]

    if (this.props.className)
      classNames.push(this.props.className)

    return classNames.join(" ")
  }

  onFilterFormSubmit(e) {
    e.preventDefault()

    const qParams = Params.serializeForm(this.refs.filterForm)
    const { queryQName } = this.state

    const changeParamsParams = {}
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
