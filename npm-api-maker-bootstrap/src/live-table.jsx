const classNames = require("classnames")
const Collection = require("@kaspernj/api-maker/src/collection")
const {debounce} = require("debounce")
const {digg, digs} = require("diggerize")
const EventCreated = require("@kaspernj/api-maker/src/event-created").default
const EventDestroyed = require("@kaspernj/api-maker/src/event-destroyed")
const EventUpdated = require("@kaspernj/api-maker/src/event-updated").default
const instanceOfClassName = require("@kaspernj/api-maker/src/instance-of-class-name")
const {LocationChanged} = require("on-location-changed/location-changed-component")
const Params = require("@kaspernj/api-maker/src/params")
const PropTypes = require("prop-types")
const React = require("react")
const {Shape} = require("set-state-compare")

import Card from "./card"
import ModelRow from "./live-table/model-row"
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

  constructor (props) {
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

  columnsAsArray () {
    if (typeof this.props.columns == "function") {
      return this.props.columns()
    }

    return this.props.columns
  }

  componentDidMount () {
    this.loadQParams()
    this.loadModels()

    if (this.props.noRecordsAvailableContent) {
      this.loadOverallCount()
    }
  }

  abilitiesToLoad () {
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

  loadModelsDebounce = debounce(() => this.loadModels())
  submitFilterDebounce = debounce(() => this.submitFilter())

  loadModels = async () => {
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

  render () {
    const {modelClass} = digs(this.props, "modelClass")
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

  cardOrTable () {
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

  tableContent () {
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
            <ModelRow key={model.id()} liveTable={this} model={model} />
          )}
        </tbody>
      </>
    )
  }

  className () {
    const classNames = ["component-api-maker-live-table"]

    if (this.props.className)
      classNames.push(this.props.className)

    return classNames.join(" ")
  }

  headersContentFromColumns () {
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

  headerClassNameForColumn (column) {
    const classNames = ["live-table-header"]

    if (column.headerProps && column.headerProps.className) classNames.push(column.headerProps.className)
    if (column.textCenter) classNames.push("text-center")
    if (column.textRight) classNames.push("text-end text-right")

    return classNames
  }

  headerLabelForColumn (column) {
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

  identifierForColumn (column) {
    if (column.identifier) return column.identifier
    if (column.attribute) return `attribute-${column.attribute}`
    if (column.sortKey) return `sort-key-${column.sortKey}`

    throw new Error("No 'attribute', 'identifier' or 'sortKey' was given")
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

  submitFilter = () => {
    const {appHistory} = this.props
    const qParams = Params.serializeForm(this.refs.filterForm)
    const {queryQName} = this.shape

    const changeParamsParams = {}
    changeParamsParams[queryQName] = qParams

    Params.changeParams(changeParamsParams, {appHistory})
  }
}
