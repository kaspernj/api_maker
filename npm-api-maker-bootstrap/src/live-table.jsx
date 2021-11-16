const classNames = require("classnames")
const {Collection, EventCreated, EventDestroyed, EventUpdated, instanceOfClassName, Params} = require("@kaspernj/api-maker")
const {debounce} = require("debounce")
const {digg, digs} = require("diggerize")
const inflection = require("inflection")
const {Link} = require("react-router-dom")
const {LocationChanged} = require("on-location-changed/location-changed-component")
const Money = require("js-money")
const PropTypes = require("prop-types")
const React = require("react")
const {Shape} = require("set-state-compare")

import Card from "./card"
import Paginate from "./paginate"
import SortLink from "./sort-link"

export default class ApiMakerBootstrapLiveTable extends React.PureComponent {
  static defaultProps = {
    card: true,
    destroyEnabled: true,
    filterCard: true,
    filterSubmitButton: true,
    preloads: [],
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
    columns: PropTypes.oneOfType([PropTypes.array, PropTypes.func]),
    columnsContent: PropTypes.func,
    controls: PropTypes.func,
    defaultParams: PropTypes.object,
    destroyEnabled: PropTypes.bool.isRequired,
    destroyMessage: PropTypes.string,
    editModelPath: PropTypes.func,
    filterCard: PropTypes.bool.isRequired,
    filterContent: PropTypes.func,
    filterSubmitLabel: PropTypes.bool.isRequired,
    filterSubmitLabel: PropTypes.node,
    headersContent: PropTypes.func,
    header: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),
    groupBy: PropTypes.array,
    modelClass: PropTypes.func.isRequired,
    noRecordsAvailableContent: PropTypes.func,
    noRecordsFoundContent: PropTypes.func,
    onModelsLoaded: PropTypes.func,
    paginateContent: PropTypes.func,
    paginationComponent: PropTypes.func,
    preloads: PropTypes.array.isRequired,
    queryName: PropTypes.string,
    select: PropTypes.object,
    selectColumns: PropTypes.object
  }

  constructor(props) {
    super(props)

    let queryName = props.queryName

    if (!queryName) {
      queryName = digg(props.modelClass.modelClassData(), "collectionKey")
    }

    this.shape = new Shape(this, {
      columns: this.columnsAsArray(),
      models: undefined,
      overallCount: undefined,
      query: undefined,
      queryName,
      queryQName: `${queryName}_q`,
      queryPageName: `${queryName}_page`,
      qParams: undefined,
      result: undefined
    })
  }

  columnsAsArray() {
    if (typeof this.props.columns == "function") {
      return this.props.columns()
    }

    return this.props.columns
  }

  componentDidMount() {
    this.loadQParams()
    this.loadModels()

    if (this.props.noRecordsAvailableContent) {
      this.loadOverallCount()
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

  async loadOverallCount() {
    const baseQuery = this.props.collection || this.props.modelClass.all()
    const overallCount = await baseQuery.count()

    this.shape.set({overallCount})
  }

  loadQParams() {
    const {queryQName} = digs(this.shape, "queryQName")
    const params = Params.parse()
    const qParams = Object.assign({}, this.props.defaultParams, params[queryQName])

    this.shape.set({qParams})
  }

  loadModelsDebounce = debounce(() => this.loadModels())
  submitFilterDebounce = debounce(() => this.submitFilter())

  async loadModels() {
    const params = Params.parse()
    const {collection, groupBy, modelClass, onModelsLoaded, preloads, select, selectColumns} = this.props
    const {qParams, queryPageName, queryQName} = this.shape

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

    if (selectColumns) query = query.selectColumns(selectColumns)

    const result = await query.result()

    if (onModelsLoaded) {
      onModelsLoaded({
        models: result.models(),
        qParams,
        query,
        result
      })
    }

    this.shape.set({query, result, models: result.models()})
  }

  render() {
    const {appHistory, modelClass} = digs(this.props, "appHistory", "modelClass")
    const {noRecordsAvailableContent, noRecordsFoundContent} = this.props
    const {overallCount, qParams, query, result, models} = digs(this.shape, "overallCount", "qParams", "query", "result", "models")

    return (
      <div className={this.className()}>
        <EventCreated modelClass={modelClass} onCreated={this.onModelCreated} />
        <LocationChanged onChanged={this.onLocationChanged} />
        {models && models.map((model) =>
          <React.Fragment key={model.id()}>
            <EventDestroyed model={model} onDestroyed={this.onModelDestroyed} />
            <EventUpdated model={model} onUpdated={this.onModelUpdated} />
          </React.Fragment>
        )}
        {this.showNoRecordsAvailableContent() &&
          <div className="live-table--no-records-available-content">
            {noRecordsAvailableContent({models, qParams, overallCount})}
          </div>
        }
        {this.showNoRecordsFoundContent()  &&
          <div className="live-table--no-records-found-content">
            {noRecordsFoundContent({models, qParams, overallCount})}
          </div>
        }
        {qParams && query && result && models && !this.showNoRecordsAvailableContent() && !this.showNoRecordsFoundContent() &&
          this.cardOrTable()
        }
      </div>
    )
  }

  showNoRecordsAvailableContent() {
    const {noRecordsAvailableContent} = this.props
    const {models, overallCount} = digs(this.shape, "models", "overallCount")

    if (models === undefined || overallCount === undefined || noRecordsAvailableContent === undefined) return
    if (models.length === 0 && overallCount === 0 && noRecordsAvailableContent) return true
  }

  showNoRecordsFoundContent() {
    const {noRecordsAvailableContent, noRecordsFoundContent} = this.props
    const {models, overallCount} = digs(this.shape, "models", "overallCount")

    if (models === undefined || noRecordsFoundContent === undefined) return

    // Dont show noRecordsAvailableContent together with noRecordsAvailableContent
    if (models.length === 0 && overallCount === 0 && noRecordsAvailableContent) return

    if (models.length === 0 && noRecordsFoundContent) return true
  }

  cardOrTable() {
    const {
      abilities,
      actionsContent,
      appHistory,
      card,
      className,
      collection,
      columns,
      columnsContent,
      controls,
      defaultParams,
      destroyEnabled,
      destroyMessage,
      editModelPath,
      filterCard,
      filterContent,
      filterSubmitButton,
      filterSubmitLabel,
      headersContent,
      header,
      groupBy,
      modelClass,
      noRecordsAvailableContent,
      noRecordsFoundContent,
      onModelsLoaded,
      paginateContent,
      paginationComponent,
      preloads,
      queryName,
      select,
      selectColumns,
      ...restProps
    } = this.props
    const {models, qParams, query, result} = digs(this.shape, "models", "qParams", "query", "result")

    let controlsContent, headerContent, PaginationComponent

    if (controls) {
      controlsContent = controls({models, qParams, query, result})
    }

    if (typeof header == "function") {
      headerContent = header({models, qParams, query, result})
    } else if (header) {
      headerContent = header
    }

    if (!paginateContent) {
      if (paginationComponent) {
        PaginationComponent = paginationComponent
      } else {
        PaginationComponent = Paginate
      }
    }

    return (
      <>
        {filterContent && filterCard &&
          <Card className="live-table--filter-card mb-4">
            {this.filterForm()}
          </Card>
        }
        {filterContent && !filterCard &&
          this.filterForm()
        }
        {card &&
          <Card className={classNames("mb-4", className)} controls={controlsContent} header={headerContent} table {...restProps}>
            {this.tableContent()}
          </Card>
        }
        {!card &&
          <table className={className} {...restProps}>
            {this.tableContent()}
          </table>
        }
        {result && PaginationComponent &&
          <PaginationComponent result={result} />
        }
        {result && paginateContent &&
          paginateContent({result})
        }
      </>
    )
  }

  filterForm = () => {
    const {submitFilterDebounce} = digs(this, "submitFilterDebounce")
    const {filterContent, filterSubmitButton} = digs(this.props, "filterContent", "filterSubmitButton")
    const {filterSubmitLabel} = this.props
    const {qParams} = digs(this.shape, "qParams")

    return (
      <form className="live-table--filter-form" onSubmit={this.onFilterFormSubmit} ref="filterForm">
        {filterContent({
          onFilterChanged: this.submitFilter,
          onFilterChangedWithDelay: submitFilterDebounce,
          qParams
        })}
        {filterSubmitButton &&
          <input
            className="btn btn-primary live-table--submit-filter-button"
            type="submit"
            value={filterSubmitLabel || I18n.t("js.api_maker_bootstrap.live_table.filter")}
          />
        }
      </form>
    )
  }

  tableContent() {
    const {modelClass} = digs(this.props, "modelClass")
    const {actionsContent, destroyEnabled, editModelPath} = this.props
    const {query, models} = this.shape

    return (
      <>
        <thead>
          <tr>
            {this.shape.columns && this.headersContentFromColumns()}
            {this.props.headersContent && this.props.headersContent({query})}
            <th />
          </tr>
        </thead>
        <tbody>
          {models.map((model) =>
            <tr className={`${inflection.dasherize(modelClass.modelClassData().paramKey)}-row`} data-model-id={model.id()} key={model.id()}>
              {this.shape.columns && this.columnsContentFromColumns(model)}
              {!this.shape.columns && this.props.columnsContent && this.props.columnsContent(this.modelCallbackArgs(model))}
              <td className="actions-column text-end text-nowrap text-right">
                {actionsContent && actionsContent(this.modelCallbackArgs(model))}
                {editModelPath && model.can("edit") &&
                  <Link className="edit-button" to={editModelPath(this.modelCallbackArgs(model))}>
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
    const contentArgs = this.modelCallbackArgs(model)
    const value = column.content(contentArgs)

    return this.presentColumnValue(value)
  }

  modelCallbackArgs(model) {
    const modelArgName = inflection.camelize(this.props.modelClass.modelClassData().name, true)
    const modelCallbackArgs = {}

    modelCallbackArgs[modelArgName] = model

    return modelCallbackArgs
  }

  columnClassNamesForColumn(column) {
    const classNames = ["live-table-column"]

    if (column.columnProps && column.columnProps.className) classNames.push(column.columnProps.className)
    if (column.textCenter) classNames.push("text-center")
    if (column.textRight) classNames.push("text-end text-right")

    return classNames
  }

  columnsContentFromColumns(model) {
    const {columns} = digs(this.shape, "columns")

    return columns.map((column) =>
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
    const {columns} = digs(this.shape, "columns")

    return columns.map((column) =>
      <th
        className={classNames(...this.headerClassNameForColumn(column))}
        data-identifier={this.identifierForColumn(column)}
        key={this.identifierForColumn(column)}
      >
        {column.sortKey && this.shape.query &&
          <SortLink attribute={column.sortKey} query={this.shape.query} title={this.headerLabelForColumn(column)} />
        }
        {(!column.sortKey || !this.shape.query) &&
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
    if ("label" in column) {
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
    const {queryQName} = digs(this.shape, "queryQName")
    const params = Params.parse()
    const qParams = Object.assign({}, this.props.defaultParams, params[queryQName])

    this.shape.set({qParams})
    this.loadModels()
  }

  onModelCreated = () => {
    this.loadModels()
  }

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
    const {queryQName} = this.shape

    const changeParamsParams = {}
    changeParamsParams[queryQName] = qParams

    Params.changeParams(changeParamsParams, {appHistory})
  }
}
