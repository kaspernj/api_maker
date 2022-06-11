const classNames = require("classnames")
const Collection = require("@kaspernj/api-maker/src/collection")
const {debounce} = require("debounce")
const {digg, digs} = require("diggerize")
const instanceOfClassName = require("@kaspernj/api-maker/src/instance-of-class-name")
const Params = require("@kaspernj/api-maker/src/params")
const PropTypes = require("prop-types")
const React = require("react")
const Shape = require("set-state-compare/src/shape")

import Card from "@kaspernj/api-maker-bootstrap/src/card"
import CollectionLoader from "@kaspernj/api-maker/src/collection-loader"
import columnVisible from "./column-visible"
import inflection from "inflection"
import ModelRow from "./model-row"
import Paginate from "@kaspernj/api-maker-bootstrap/src/paginate"
import SortLink from "@kaspernj/api-maker-bootstrap/src/sort-link"
import TableSettings from "./table-settings"
import uniqunize from "uniqunize"

export default class ApiMakerTable extends React.PureComponent {
  static defaultProps = {
    card: true,
    destroyEnabled: true,
    filterCard: true,
    filterSubmitButton: true,
    noRecordsAvailableContent: undefined,
    noRecordsFoundContent: undefined,
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
    currentUser: PropTypes.object,
    defaultDateFormatName: PropTypes.string,
    defaultDateTimeFormatName: PropTypes.string,
    defaultParams: PropTypes.object,
    destroyEnabled: PropTypes.bool.isRequired,
    destroyMessage: PropTypes.string,
    editModelPath: PropTypes.func,
    filterCard: PropTypes.bool.isRequired,
    filterContent: PropTypes.func,
    filterSubmitLabel: PropTypes.node,
    groupBy: PropTypes.array,
    header: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),
    identifier: PropTypes.string,
    modelClass: PropTypes.func.isRequired,
    noRecordsAvailableContent: PropTypes.func,
    noRecordsFoundContent: PropTypes.func,
    onModelsLoaded: PropTypes.func,
    paginateContent: PropTypes.func,
    paginationComponent: PropTypes.func,
    preloads: PropTypes.array.isRequired,
    queryName: PropTypes.string,
    select: PropTypes.object,
    selectColumns: PropTypes.object,
    viewModelPath: PropTypes.func
  }

  filterFormRef = React.createRef()

  constructor (props) {
    super(props)

    const collectionKey = digg(props.modelClass.modelClassData(), "collectionKey")
    let queryName = props.queryName

    if (!queryName) queryName = collectionKey

    const columnsAsArray = this.columnsAsArray()

    this.shape = new Shape(this, {
      columns: columnsAsArray,
      identifier: this.props.identifier || `${collectionKey}-default`,
      models: undefined,
      overallCount: undefined,
      preload: undefined,
      preparedColumns: undefined,
      query: undefined,
      queryName,
      queryQName: `${queryName}_q`,
      queryPageName: `${queryName}_page`,
      qParams: undefined,
      result: undefined,
      showNoRecordsAvailableContent: false,
      showNoRecordsFoundContent: false
    })

    this.loadTableSetting()
  }

  async loadTableSetting() {
    this.tableSettings = new TableSettings({table: this})

    const tableSetting = await this.tableSettings.loadExistingOrCreateTableSettings()
    const {columns, preload} = this.tableSettings.preparedColumns(tableSetting)

    this.shape.set({
      preparedColumns: columns,
      preload: this.mergedPreloads(preload)
    })
  }

  columnsAsArray = () => {
    if (typeof this.props.columns == "function") return this.props.columns()

    return this.props.columns
  }

  submitFilterDebounce = debounce(() => this.submitFilter())

  mergedPreloads(preload) {
    const {preloads} = this.props
    let mergedPreloads = []

    if (preloads) mergedPreloads = mergedPreloads.concat(preloads)
    if (preload) mergedPreloads = mergedPreloads.concat(preload)

    return uniqunize(mergedPreloads)
  }

  render () {
    const {modelClass, noRecordsAvailableContent, noRecordsFoundContent} = digs(this.props, "modelClass", "noRecordsAvailableContent", "noRecordsFoundContent")
    const {collection, defaultParams, select, selectColumns} = this.props
    const {
      overallCount,
      preload,
      qParams,
      query,
      result,
      models,
      showNoRecordsAvailableContent,
      showNoRecordsFoundContent
    } = digs(
      this.shape,
      "overallCount",
      "preload",
      "qParams",
      "query",
      "result",
      "models",
      "showNoRecordsAvailableContent",
      "showNoRecordsFoundContent"
    )

    return (
      <div className={this.className()}>
        {preload !== undefined &&
          <CollectionLoader
            abilities={this.abilitiesToLoad()}
            defaultParams={defaultParams}
            collection={collection}
            component={this}
            modelClass={modelClass}
            noRecordsAvailableContent={noRecordsAvailableContent}
            noRecordsFoundContent={noRecordsFoundContent}
            preloads={preload}
            select={select}
            selectColumns={selectColumns}
          />
        }
        {showNoRecordsAvailableContent &&
          <div className="live-table--no-records-available-content">
            {noRecordsAvailableContent({models, qParams, overallCount})}
          </div>
        }
        {showNoRecordsFoundContent &&
          <div className="live-table--no-records-found-content">
            {noRecordsFoundContent({models, qParams, overallCount})}
          </div>
        }
        {qParams && query && result && models && !showNoRecordsAvailableContent && !showNoRecordsFoundContent &&
          this.cardOrTable()
        }
      </div>
    )
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
      currentUser,
      defaultDateFormatName,
      defaultDateTimeFormatName,
      defaultParams,
      destroyEnabled,
      destroyMessage,
      editModelPath,
      filterCard,
      filterContent,
      filterSubmitButton,
      filterSubmitLabel,
      groupBy,
      header,
      identifier,
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
      viewModelPath,
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
    const {filterFormRef, submitFilter, submitFilterDebounce} = digs(this, "filterFormRef", "submitFilter", "submitFilterDebounce")
    const {filterContent, filterSubmitButton} = digs(this.props, "filterContent", "filterSubmitButton")
    const {filterSubmitLabel} = this.props
    const {qParams} = digs(this.shape, "qParams")

    return (
      <form className="live-table--filter-form" onSubmit={this.onFilterFormSubmit} ref={filterFormRef}>
        {filterContent({
          onFilterChanged: submitFilter,
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
    const {models, preparedColumns} = digs(this.shape, "models", "preparedColumns")

    return (
      <>
        <thead>
          <tr>
            {this.headersContentFromColumns()}
            <th />
          </tr>
        </thead>
        <tbody>
          {models.map((model) =>
            <ModelRow key={model.id()} liveTable={this} model={model} preparedColumns={preparedColumns} />
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
    const {preparedColumns, query} = digs(this.shape, "preparedColumns", "query")

    return preparedColumns?.map(({column, tableSettingColumn}) => columnVisible(column, tableSettingColumn) &&
      <th
        className={classNames(...this.headerClassNameForColumn(column))}
        data-identifier={tableSettingColumn.identifier()}
        key={tableSettingColumn.identifier()}
      >
        {tableSettingColumn.hasSortKey() && query &&
          <SortLink attribute={tableSettingColumn.sortKey()} query={query} title={this.headerLabelForColumn(column)} />
        }
        {(!tableSettingColumn.hasSortKey() || !query) &&
          this.headerLabelForColumn(column)
        }
      </th>
    )
  }

  headerClassNameForColumn (column) {
    const classNames = ["live-table-header"]

    if (column.commonProps && column.commonProps.className) classNames.push(column.commonProps.className)
    if (column.headerProps && column.headerProps.className) classNames.push(column.headerProps.className)
    if (column.textCenter) classNames.push("text-center")
    if (column.textRight) classNames.push("text-end text-right")

    return classNames
  }

  headerLabelForColumn (column) {
    const {modelClass} = digs(this.props, "modelClass")

    if ("label" in column) {
      if (typeof column.label == "function") {
        return column.label()
      } else {
        return column.label
      }
    }

    let currentModelClass = modelClass

    // Calculate current model class through path
    if (column.path) {
      for (const pathPart of column.path) {
        const relationships = digg(currentModelClass.modelClassData(), "relationships")
        const relationship = relationships.find((relationshipInArray) => relationshipInArray.name == inflection.underscore(pathPart))

        currentModelClass = digg(require("@kaspernj/api-maker/src/models"), digg(relationship, "className"))
      }
    }

    if (column.attribute) return currentModelClass.humanAttributeName(column.attribute)

    throw new Error("No 'label' or 'attribute' was given")
  }

  onFilterFormSubmit = (e) => {
    e.preventDefault()
    this.submitFilter()
  }

  submitFilter = () => {
    const {filterFormRef} = digs(this, "filterFormRef")
    const filterForm = digg(filterFormRef, "current")
    const {appHistory} = this.props
    const qParams = Params.serializeForm(filterForm)
    const {queryQName} = this.shape
    const changeParamsParams = {}

    changeParamsParams[queryQName] = qParams

    Params.changeParams(changeParamsParams, {appHistory})
  }
}
