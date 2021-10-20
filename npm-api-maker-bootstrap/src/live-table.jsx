const classNames = require("classnames")
const {Collection, EventCreated, EventDestroyed, EventLocationChanged, EventUpdated, instanceOfClassName, Params} = require("@kaspernj/api-maker")
const {debounce} = require("debounce")
const {digg, digs} = require("@kaspernj/object-digger")
const inflection = require("inflection")
const {Link} = require("react-router-dom")
const Money = require("js-money")
const PropTypes = require("prop-types")
const React = require("react")

import Card from "./card"
import Paginate from "./paginate"
import SortLink from "./sort-link"

export default class ApiMakerBootstrapLiveTable extends React.PureComponent {
  static defaultProps = {
    card: true,
    destroyEnabled: true,
    preloads: [],
    qParams: undefined,
    select: {}
  }

  static propTypes = {
    abilities: PropTypes.object,
    actionsContent: PropTypes.func,
    appHistory: PropTypes.object,
    card: PropTypes.bool.isRequired,
    className: PropTypes.string,
    collection: PropTypes.oneOfType([
      instanceOfClassName("ApiMakerCollection"),
      PropTypes.instanceOf(Collection)
    ]),
    columns: PropTypes.array,
    columnsContent: PropTypes.func,
    controls: PropTypes.func,
    defaultParams: PropTypes.object,
    destroyEnabled: PropTypes.bool.isRequired,
    destroyMessage: PropTypes.string,
    editModelPath: PropTypes.func,
    filterContent: PropTypes.func,
    filterSubmitLabel: PropTypes.node,
    headersContent: PropTypes.func,
    header: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),
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
    const qParams = Object.assign({}, this.props.defaultParams, params[queryQName])

    return this.setState({qParams})
  }

  loadModelsDebounce = debounce(() => this.loadModels())
  submitFilterDebounce = debounce(() => this.submitFilter())

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
      appHistory,
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
    const {models, qParams, query, result} = digs(this.state, "models", "qParams", "query", "result")
    const {submitFilterDebounce} = digs(this, "submitFilterDebounce")

    let controlsContent, headerContent, PaginationComponent

    if (controls) {
      controlsContent = controls({models, qParams, query, result})
    }

    if (typeof header == "function") {
      headerContent = header({models, qParams, query, result})
    } else if (header) {
      headerContent = header
    }

    if (paginationComponent) {
      PaginationComponent = paginationComponent
    } else {
      PaginationComponent = Paginate
    }

    return (
      <>
        <EventCreated modelClass={modelClass} onCreated={this.onModelCreated} />
        <EventLocationChanged history={appHistory} onChanged={this.onLocationChanged} />
        {models.map(model =>
          <React.Fragment key={`events-${model.id()}`}>
            <EventDestroyed model={model} onDestroyed={this.onModelDestroyed} />
            <EventUpdated model={model} onUpdated={this.onModelUpdated} />
          </React.Fragment>
        )}
        {filterContent &&
          <Card className="mb-4">
            <form onSubmit={this.onFilterFormSubmit} ref="filterForm">
              {filterContent({
                onFilterChanged: this.submitFilter,
                onFilterChangedWithDelay: submitFilterDebounce,
                qParams
              })}
              <input className="btn btn-primary" label={filterSubmitLabel} type="submit" />
            </form>
          </Card>
        }

        {card &&
          <Card className={classNames("mb-4", className)} controls={controlsContent} header={headerContent} table>
            {this.tableContent()}
          </Card>
        }
        {!card &&
          <table className={className} {...restProps}>
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
    const {modelClass} = digs(this.props, "modelClass")
    const {actionsContent, destroyEnabled, editModelPath} = this.props
    const {query, models} = this.state

    return (
      <>
        <thead>
          <tr>
            {this.props.columns && this.headersContentFromColumns()}
            {this.props.headersContent && this.props.headersContent({query})}
            <th />
          </tr>
        </thead>
        <tbody>
          {models.map((model) =>
            <tr className={`${inflection.dasherize(modelClass.modelClassData().paramKey)}-row`} data-model-id={model.id()} key={model.id()}>
              {this.props.columns && this.columnsContentFromColumns(model)}
              {this.props.columnsContent && this.props.columnsContent({model})}
              <td className="actions-column text-end text-nowrap text-right">
                {actionsContent && actionsContent({model})}
                {editModelPath && model.can("edit") &&
                  <Link className="edit-button" to={editModelPath({model})}>
                    <i className="fa fa-edit la la-edit" />
                  </Link>
                }
                {destroyEnabled && model.can("destroy") &&
                  <a className="destroy-button" href="#" onClick={(e) => this.onDestroyClicked(e, model)}>
                    <i className="fa fa-remove la la-remove" />
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

  columnContentFromContentArg(column, model) {
    const modelArgName = inflection.camelize(this.props.modelClass.modelClassData().name, true)
    const contentArgs = {}

    contentArgs[modelArgName] = model

    const value = column.content(contentArgs)

    return this.presentColumnValue(value)
  }

  columnClassNamesForColumn(column) {
    const classNames = ["live-table-column"]

    if (column.columnProps && column.columnProps.className) classNames.push(column.columnProps.className)
    if (column.textCenter) classNames.push("text-center")
    if (column.textRight) classNames.push("text-end text-right")

    return classNames
  }

  columnsContentFromColumns(model) {
    return this.props.columns.map((column) =>
      <td
        className={classNames(this.columnClassNamesForColumn(column))}
        data-identifier={this.identifierForColumn(column)}
        key={this.identifierForColumn(column)}
      >
        {column.content && this.columnContentFromContentArg(column, model)}
        {!column.content && column.attribute && this.columnsContentFromAttributeAndPath(column, model)}
      </td>
    )
  }

  columnsContentFromAttributeAndPath(column, model) {
    const {attribute} = digs(column, "attribute")
    const currentModelClass = this.props.modelClass
    const path = column.path || []

    if (path.length > 0) throw new Error("'path' support not implemented")

    if (!(attribute in model)) throw new Error(`${currentModelClass.modelName().name} doesn't respond to ${attribute}`)

    const value = model[attribute]()

    return this.presentColumnValue(value)
  }

  headersContentFromColumns() {
    return this.props.columns.map((column) =>
      <th
        className={classNames(...this.headerClassNameForColumn(column))}
        data-identifier={this.identifierForColumn(column)}
        key={this.identifierForColumn(column)}
      >
        {column.sortKey && this.state.query &&
          <SortLink attribute={column.sortKey} query={this.state.query} title={this.headerLabelForColumn(column)} />
        }
        {(!column.sortKey || !this.state.query) &&
          this.headerLabelForColumn(column)
        }
      </th>
    )
  }

  headerClassNameForColumn(column) {
    const classNames = ["live-table-header"]

    if (column.headerProps && column.headerProps.className) classNames.push(column.headerProps.className)
    if (column.textCenter) classNames.push("text-center")
    if (column.textRight) classNames.push("text-end text-right")

    return classNames
  }

  headerLabelForColumn(column) {
    if (column.label) {
      if (typeof column.label == "function") {
        return column.label()
      } else {
        return column.label
      }
    }

    if (column.attribute) return this.props.modelClass.humanAttributeName(column.attribute)

    throw new Error("No 'label' or 'attribute' was given")
  }

  identifierForColumn(column) {
    if (column.identifier) return column.identifier
    if (column.attribute) return `attribute-${column.attribute}`
    if (column.sortKey) return `sort-key-${column.sortKey}`

    throw new Error("No 'attribute', 'identifier' or 'sortKey' was given")
  }

  onDestroyClicked = async (e, model) => {
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

  onFilterFormSubmit = (e) => {
    e.preventDefault()
    this.submitFilter()
  }

  onLocationChanged = () => {
    if (this.state.currentHref != location.href) {
      const {queryQName} = digs(this.state, "queryQName")
      const params = Params.parse()
      const qParams = Object.assign({}, this.props.defaultParams, params[queryQName])

      this.setState(
        {
          currentHref: location.href,
          qParams
        },
        () => this.loadModels()
      )
    }
  }

  onModelCreated = () => {
    this.loadModels()
  }

  onModelDestroyed = (args) => {
    const {models} = digs(this.state, "models")

    this.setState({
      models: models.filter(model => model.id() != args.model.id())
    })
  }

  onModelUpdated = (args) => {
    const {models} = digs(this.state, "models")
    const updatedModel = digg(args, "model")
    const foundModel = models.find((model) => model.id() == updatedModel.id())

    if (foundModel) {
      this.loadModelsDebounce()
    }
  }

  presentColumnValue(value) {
    if (value instanceof Date) {
      return I18n.l("time.formats.default", value)
    } else if (value instanceof Money) {
      return MoneyFormatter.format(value)
    } else if (typeof value == "boolean") {
      if (value) {
        return I18n.t("js.shared.yes")
      }

      return I18n.t("js.shared.no")
    } else if (Array.isArray(value)) {
      return value
        .map((valuePart) => this.presentColumnValue(valuePart))
        .filter((valuePart) => Boolean(valuePart))
        .join(", ")
    }

    return value
  }

  submitFilter = () => {
    const {appHistory} = this.props
    const qParams = Params.serializeForm(this.refs.filterForm)
    const {queryQName} = this.state

    const changeParamsParams = {}
    changeParamsParams[queryQName] = qParams

    Params.changeParams(changeParamsParams, {appHistory})
  }
}
