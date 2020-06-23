import { EventCreated, EventDestroyed, Params } from "@kaspernj/api-maker"
import { Paginate } from "@kaspernj/api-maker-bootstrap"
import Collection from "api-maker/collection"
import PropTypes from "prop-types"
import PropTypesExact from "prop-types-exact"
import React from "react"

const inflection = require("inflection")

export default class ApiMakerBootstrapLiveTable extends React.Component {
  static defaultProps = {
    destroyEnabled: true,
    preloads: [],
    select: {}
  }

  static propTypes = PropTypesExact({
    className: PropTypes.string,
    collection: PropTypes.instanceOf(Collection),
    columnsContent: PropTypes.func.isRequired,
    defaultParams: PropTypes.object,
    destroyEnabled: PropTypes.bool.isRequired,
    destroyMessage: PropTypes.string,
    editModelPath: PropTypes.func,
    filterContent: PropTypes.func,
    filterSubmitLabel: PropTypes.node,
    headersContent: PropTypes.func.isRequired,
    modelClass: PropTypes.func.isRequired,
    onModelsLoaded: PropTypes.func,
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
      this.setState({currentHref: location.href, qParams}, () => this.loadModels())
    }
  }

  abilitiesToLoad() {
    const abilitiesToLoad = []
    const {abilities} = this.props

    if (abilities) {
      for (const ability of abilities) {
        abilitiesToLoad.push(ability)
      }
    }

    if (this.props.destroyEnabled) {
      abilitiesToLoad.push("destroy")
    }

    if (this.props.editModelPath) {
      abilitiesToLoad.push("edit")
    }

    if (this.props.viewModelPath) {
      abilitiesToLoad.push("show")
    }

    return abilitiesToLoad
  }

  async loadQParams() {
    const { queryQName } = this.state
    const params = Params.parse()
    const qParams = params[queryQName] || this.props.defaultParams || {}
    return this.setState({qParams})
  }

  async loadModels() {
    const params = Params.parse()
    const { modelClass, onModelsLoaded, preloads, select } = this.props
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

    const abilitiesToLoad = this.abilitiesToLoad()

    if (abilitiesToLoad.length > 0) {
      const modelClassName = modelClass.modelClassData().name
      const loadAbilitiesArgument = {}

      loadAbilitiesArgument[modelClassName] = abilitiesToLoad
      query = query.abilities(loadAbilitiesArgument)
    }

    const result = await query.result()

    if (onModelsLoaded) {
      onModelsLoaded({
        models: result.models(),
        qParams,
        query,
        result
      })
    }

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
    const { destroyEnabled, editModelPath, filterContent, filterSubmitLabel, modelClass } = this.props
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
              <th />
            </tr>
          </thead>
          <tbody>
            {models.map(model =>
              <tr className={`${inflection.singularize(modelClass.modelClassData().collectionName)}-row`} data-model-id={model.id()} key={model.cacheKey()}>
                {this.props.columnsContent({model})}
                <td className="actions-column text-nowrap text-right">
                  {editModelPath && model.can("edit") &&
                    <Link className="edit-button" to={editModelPath({model})}>
                      <i className="la la-edit" />
                    </Link>
                  }
                  {destroyEnabled && model.can("destroy") &&
                    <a className="destroy-button" href="#" onClick={(e) => this.onDestroyClicked(e, model)}>
                      <i className="la la-remove" />
                    </a>
                  }
                </td>
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

  async onDestroyClicked(e, model) {
    e.preventDefault()

    const {destroyMessage} = this.props

    if (!confirm(I18n.t("js.shared.are_you_sure"))) {
      return
    }

    try {
      model.destroy()

      if (destroyMessage) {
        Notification.success(destroyMessage)
      }
    } catch (error) {
      Notification.errorResponse(error)
    }
  }

  onFilterFormSubmit(e) {
    e.preventDefault()

    const qParams = Params.serializeForm(this.refs.filterForm)
    const { queryQName } = this.state

    const changeParamsParams = {}
    changeParamsParams[queryQName] = qParams

    Params.changeParams(changeParamsParams)

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
