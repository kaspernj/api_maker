const {Collection, EventCreated, EventDestroyed, EventUpdated, instanceOfClassName, Params} = require("@kaspernj/api-maker")
const {debounce} = require("debounce")
const {digg, digs} = require("@kaspernj/object-digger")
const inflection = require("inflection")
const PropTypes = require("prop-types")
const React = require("react")

import {Card, Paginate} from "@kaspernj/api-maker-bootstrap"

export default class ApiMakerBootstrapLiveTable extends React.Component {
  static defaultProps = {
    card: true,
    destroyEnabled: true,
    preloads: [],
    select: {}
  }

  static propTypes = {
    abilities: PropTypes.object,
    actionsContent: PropTypes.func,
    card: PropTypes.bool.isRequired,
    className: PropTypes.string,
    collection: PropTypes.oneOfType([
      instanceOfClassName("ApiMakerCollection"),
      PropTypes.instanceOf(Collection)
    ]),
    columnsContent: PropTypes.func.isRequired,
    controls: PropTypes.func,
    defaultParams: PropTypes.object,
    destroyEnabled: PropTypes.bool.isRequired,
    destroyMessage: PropTypes.string,
    editModelPath: PropTypes.func,
    filterContent: PropTypes.func,
    filterSubmitLabel: PropTypes.node,
    headersContent: PropTypes.func.isRequired,
    header: PropTypes.func,
    groupBy: PropTypes.array,
    modelClass: PropTypes.func.isRequired,
    onModelsLoaded: PropTypes.func,
    paginationComponent: PropTypes.func,
    preloads: PropTypes.array.isRequired,
    queryName: PropTypes.string,
    select: PropTypes.object
  }

  constructor(props) {
    super(props)

    let queryName = props.queryName

    if (!queryName) {
      queryName = digg(props.modelClass.modelClassData(), "collectionKey")
    }

    this.state = {
      currentHref: location.href,
      models: undefined,
      query: undefined,
      queryName,
      queryQName: `${queryName}_q`,
      queryPageName: `${queryName}_page`
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
    const abilitiesToLoad = {}
    const {abilities, modelClass} = this.props
    const ownAbilities = []

    if (this.props.destroyEnabled) {
      ownAbilities.push("destroy")
    }

    if (this.props.editModelPath) {
      ownAbilities.push("edit")
    }

    if (this.props.viewModelPath) {
      ownAbilities.push("show")
    }

    if (ownAbilities.length > 0) {
      const modelClassName = digg(modelClass.modelClassData(), "name")

      abilitiesToLoad[modelClassName] = ownAbilities
    }

    if (abilities) {
      for (const modelName in abilities) {
        if (!(modelName in abilitiesToLoad)) {
          abilitiesToLoad[modelName] = []
        }

        for (const ability of abilities[modelName]) {
          abilitiesToLoad[modelName].push(ability)
        }
      }
    }

    return abilitiesToLoad
  }

  async loadQParams() {
    const { queryQName } = this.state
    const params = Params.parse()
    const qParams = params[queryQName] || this.props.defaultParams || {}
    return this.setState({qParams})
  }

  loadModelsDebounce = debounce(() => this.loadModels())

  async loadModels() {
    const params = Params.parse()
    const { collection, groupBy, modelClass, onModelsLoaded, preloads, select } = this.props
    const { qParams, queryPageName, queryQName } = this.state

    let query = collection || modelClass

    if (groupBy) query = query.groupBy(groupBy)

    query = query
      .ransack(qParams)
      .searchKey(queryQName)
      .page(params[queryPageName])
      .pageKey(queryPageName)
      .preload(preloads)
      .select(select)

    const abilitiesToLoad = this.abilitiesToLoad()

    if (Object.keys(abilitiesToLoad).length > 0) {
      query = query.abilities(abilitiesToLoad)
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
        {qParams && query && result && models && this.cardOrTable()}
      </div>
    )
  }

  cardOrTable() {
    const {
      abilities,
      actionsContent,
      card,
      className,
      collection,
      columnsContent,
      controls,
      defaultParams,
      destroyEnabled,
      destroyMessage,
      editModelPath,
      filterContent,
      filterSubmitLabel,
      headersContent,
      header,
      groupBy,
      modelClass,
      onModelsLoaded,
      paginationComponent,
      preloads,
      queryName,
      select,
      ...restProps
    } = this.props
    const { models, query, result } = digs(this.state, "models", "query", "result")

    let controlsContent, headerContent, PaginationComponent

    if (controls) {
      controlsContent = controls({models, qParams, query, result})
    }

    if (header) {
      headerContent = header({models, qParams, query, result})
    }

    if (paginationComponent) {
      PaginationComponent = paginationComponent
    } else {
      PaginationComponent = Paginate
    }

    return (
      <>
        <EventCreated modelClass={modelClass} onCreated={() => this.onModelCreated()} />
        {models.map(model =>
          <React.Fragment key={`events-${model.id()}`}>
            <EventDestroyed model={model} onDestroyed={(args) => this.onModelDestroyed(args)} />
            <EventUpdated model={model} onUpdated={(args) => this.onModelUpdated(args)} />
          </React.Fragment>
        )}
        {filterContent &&
          <Card className="mb-4">
            <form onSubmit={(e) => this.onFilterFormSubmit(e)} ref="filterForm">
              {filterContent({qParams})}
              <input className="btn btn-primary" label={filterSubmitLabel} type="submit" />
            </form>
          </Card>
        }

        {card &&
          <Card className="mb-4" controls={controlsContent} header={headerContent} table>
            {this.tableContent()}
          </Card>
        }
        {!card &&
          <table {...restProps}>
            {this.tableContent()}
          </table>
        }
        {result &&
          <PaginationComponent result={result} />
        }
      </>
    )
  }

  tableContent() {
    const { modelClass } = digs(this.props, "modelClass")
    const { actionsContent, destroyEnabled, editModelPath } = this.props
    const { query, models } = this.state

    return (
      <>
        <thead>
          <tr>
            {this.props.headersContent({query})}
            <th />
          </tr>
        </thead>
        <tbody>
          {models.map((model) =>
            <tr className={`${inflection.singularize(modelClass.modelClassData().collectionName)}-row`} data-model-id={model.id()} key={model.cacheKey()}>
              {this.props.columnsContent({model})}
              <td className="actions-column text-nowrap text-right">
                {actionsContent && actionsContent({model})}
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
      </>
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
      await model.destroy()

      if (destroyMessage) {
        FlashMessage.success(destroyMessage)
      }
    } catch (error) {
      FlashMessage.errorResponse(error)
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
    const {models} = digs(this.state, "models")

    this.setState({
      models: models.filter(model => model.id() != args.model.id())
    })
  }

  onModelUpdated(args) {
    const {models} = digs(this.state, "models")
    const updatedModel = digg(args, "model")
    const foundModel = models.find((model) => model.id() == updatedModel.id())

    if (foundModel) {
      this.loadModelsDebounce()
    }
  }
}
