import "./style"
import BaseComponent from "../base-component"
import Card from "../bootstrap/card"
import classNames from "classnames"
import Collection from "../collection"
import columnVisible from "./column-visible.mjs"
import debounce from "debounce"
import {digg, digs} from "diggerize"
import Filters from "./filters"
import HeaderColumn from "./header-column"
import * as inflection from "inflection"
import modelClassRequire from "../model-class-require.mjs"
import ModelRow from "./model-row"
import Paginate from "../bootstrap/paginate"
import Params from "../params"
import PropTypes from "prop-types"
import React, {memo, useMemo, useRef} from "react"
import selectCalculator from "./select-calculator"
import Select from "../inputs/select"
import Settings from "./settings"
import {shapeComponent} from "set-state-compare/src/shape-component"
import TableSettings from "./table-settings"
import uniqunize from "uniqunize"
import useBreakpoint from "./use-breakpoint"
import useCollection from "../use-collection"
import useQueryParams from "on-location-changed/src/use-query-params.js"

const paginationOptions = [30, 60, 90, ["All", "all"]]
const WorkerPluginsCheckAllCheckbox = React.lazy(() => import("./worker-plugins-check-all-checkbox"))

export default memo(shapeComponent(class ApiMakerTable extends BaseComponent {
  static defaultProps = {
    card: true,
    destroyEnabled: true,
    filterCard: true,
    filterSubmitButton: true,
    noRecordsAvailableContent: undefined,
    noRecordsFoundContent: undefined,
    preloads: [],
    select: {},
    workplace: false
  }

  static propTypes = {
    abilities: PropTypes.object,
    actionsContent: PropTypes.func,
    appHistory: PropTypes.object,
    card: PropTypes.bool.isRequired,
    className: PropTypes.string,
    collection: PropTypes.instanceOf(Collection),
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
    queryMethod: PropTypes.func,
    queryName: PropTypes.string,
    select: PropTypes.object,
    selectColumns: PropTypes.object,
    viewModelPath: PropTypes.func,
    workplace: PropTypes.bool.isRequired
  }

  setup() {
    const {breakpoint} = useBreakpoint()
    const queryParams = useQueryParams()

    this.setInstance({
      breakpoint,
      filterFormRef: useRef()
    })

    const collectionKey = digg(this.p.modelClass.modelClassData(), "collectionKey")
    let queryName = this.props.queryName

    if (!queryName) queryName = collectionKey

    const columnsAsArray = this.columnsAsArray()
    const querySName = `${queryName}_s`

    this.useStates({
      columns: columnsAsArray,
      currentWorkplace: undefined,
      fixedTableLayout: undefined,
      identifier: () => this.props.identifier || `${collectionKey}-default`,
      preload: undefined,
      preparedColumns: undefined,
      queryName,
      queryQName: () => `${queryName}_q`,
      queryPageName: () => `${queryName}_page`,
      querySName,
      showFilters: () => Boolean(queryParams[querySName]),
      showSettings: false,
      tableSetting: undefined,
      tableSettingFullCacheKey: undefined
    })

    useMemo(() => {
      this.loadTableSetting()

      if (this.props.workplace) this.loadCurrentWorkplace()
    }, [])

    let collectionReady = true
    let select

    if (!this.state.preparedColumns) {
      collectionReady = false
    }

    if (collectionReady) {
      select = selectCalculator({table: this})
    }

    this.collection = useCollection({
      abilities: this.abilitiesToLoad(),
      defaultParams: this.props.defaultParams,
      collection: this.props.collection,
      groupBy: this.props.groupBy,
      ifCondition: collectionReady,
      modelClass: this.props.modelClass,
      onModelsLoaded: this.props.onModelsLoaded,
      noRecordsAvailableContent: this.props.noRecordsAvailableContent,
      noRecordsFoundContent: this.props.noRecordsFoundContent,
      pagination: true,
      preloads: this.state.preload,
      queryMethod: this.props.queryMethod,
      queryName,
      select,
      selectColumns: this.props.selectColumns
    })
  }

  async loadCurrentWorkplace() {
    const Workplace = modelClassRequire("Workplace")
    const result = await Workplace.current()
    const currentWorkplace = digg(result, "current", 0)

    this.setState({currentWorkplace})
  }

  async loadTableSetting() {
    this.tableSettings = new TableSettings({table: this})

    const tableSetting = await this.tableSettings.loadExistingOrCreateTableSettings()
    const {columns, preload} = this.tableSettings.preparedColumns(tableSetting)

    this.setState({
      fixedTableLayout: tableSetting.fixedTableLayout(),
      preparedColumns: columns,
      preload: this.mergedPreloads(preload),
      tableSetting,
      tableSettingFullCacheKey: tableSetting.fullCacheKey()
    })
  }

  updateSettingsFullCacheKey = () => this.setState({tableSettingFullCacheKey: this.state.tableSetting.fullCacheKey()})

  columnsAsArray = () => {
    if (typeof this.props.columns == "function") return this.props.columns()

    return this.props.columns
  }

  mergedPreloads(preload) {
    const {preloads} = this.props
    let mergedPreloads = []

    if (preloads) mergedPreloads = mergedPreloads.concat(preloads)
    if (preload) mergedPreloads = mergedPreloads.concat(preload)

    return uniqunize(mergedPreloads)
  }

  render () {
    const {modelClass, noRecordsAvailableContent, noRecordsFoundContent} = this.p
    const {collection, currentUser} = this.props
    const {queryName, querySName, showFilters} = this.s
    const {
      models,
      overallCount,
      qParams,
      query,
      result,
      showNoRecordsAvailableContent,
      showNoRecordsFoundContent
    } = digs(
      this.collection,
      "models",
      "overallCount",
      "qParams",
      "query",
      "result",
      "showNoRecordsAvailableContent",
      "showNoRecordsFoundContent"
    )

    if (collection && collection.args.modelClass.modelClassData().name != modelClass.modelClassData().name) {
      throw new Error(
        `Model class from collection '${collection.args.modelClass.modelClassData().name}' ` +
        `didn't match model class on table: '${modelClass.modelClassData().name}'`
      )
    }

    return (
      <div className={this.className()} data-fixed-table-layout={this.s.fixedTableLayout}>
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
        {showFilters &&
          <Filters currentUser={currentUser} modelClass={modelClass} queryName={queryName} querySName={querySName} />
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

    if (this.props.destroyEnabled) ownAbilities.push("destroy")
    if (this.props.editModelPath) ownAbilities.push("edit")
    if (this.props.viewModelPath) ownAbilities.push("show")

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
      queryMethod,
      queryName,
      select,
      selectColumns,
      viewModelPath,
      workplace,
      ...restProps
    } = this.props
    const {models, qParams, query, result} = digs(this.collection, "models", "qParams", "query", "result")

    let headerContent, PaginationComponent

    if (typeof header == "function") {
      headerContent = header({models, qParams, query, result})
    } else if (header) {
      headerContent = header
    } else {
      headerContent = modelClass.modelName().human({count: 2})
    }

    if (!paginateContent) {
      if (paginationComponent) {
        PaginationComponent = paginationComponent
      } else {
        PaginationComponent = Paginate
      }
    }

    const TableComponent = this.responsiveComponent("table")

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
          <Card className={classNames("live-table--table-card", "mb-4", className)} controls={this.tableControls()} header={headerContent} footer={this.tableFooter()} table={!this.isSmallScreen()} {...restProps}>
            {this.tableContent()}
          </Card>
        }
        {!card &&
          <TableComponent className={className} {...restProps}>
            {this.tableContent()}
          </TableComponent>
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
    const {filterFormRef, submitFilter, submitFilterDebounce} = this.tt
    const {filterContent, filterSubmitButton} = this.p
    const {filterSubmitLabel} = this.props
    const {qParams} = digs(this.collection, "qParams")

    return (
      <form className="live-table--filter-form" onSubmit={this.onFilterFormSubmit} ref={filterFormRef}>
        {"s" in qParams &&
          <input name="s" type="hidden" value={qParams.s} />
        }
        {filterContent({
          onFilterChanged: submitFilter,
          onFilterChangedWithDelay: submitFilterDebounce,
          qParams
        })}
        {filterSubmitButton &&
          <input
            className="btn btn-primary live-table--submit-filter-button"
            type="submit"
            style={{marginTop: "8px"}}
            value={filterSubmitLabel || I18n.t("js.api_maker_bootstrap.live_table.filter")}
          />
        }
      </form>
    )
  }

  onFilterClicked = (e) => {
    e.preventDefault()
    this.setState({showFilters: !this.state.showFilters})
  }

  onFixedTableLayoutChanged = (fixedTableLayout) => {
    this.setState({fixedTableLayout})
  }

  onPerPageChanged = (e) => {
    const {queryName} = this.s
    const newPerPageValue = digg(e, "target", "value")
    const perKey = `${queryName}_per`
    const paramsChange = {}

    paramsChange[perKey] = newPerPageValue

    Params.changeParams(paramsChange)
  }

  tableControls() {
    const {controls} = this.props
    const {showSettings} = this.s
    const {models, qParams, query, result} = digs(this.collection, "models", "qParams", "query", "result")

    return (
      <>
        {controls && controls({models, qParams, query, result})}
        <a className="filter-button" href="#" onClick={this.tt.onFilterClicked}>
          <i className="fa fa-fw fa-magnifying-glass la la-fw la-search" />
        </a>
        <span style={{position: "relative"}}>
          {showSettings &&
            <Settings onFixedTableLayoutChanged={this.tt.onFixedTableLayoutChanged} onRequestClose={this.tt.onRequestCloseSettings} table={this} />
          }
          <a className="settings-button" href="#" onClick={this.tt.onSettingsClicked}>
            <i className="fa fa-fw fa-gear la la-fw la-gear" />
          </a>
        </span>
      </>
    )
  }

  tableContent () {
    const {workplace} = this.p
    const {currentWorkplace, preparedColumns, tableSettingFullCacheKey} = this.s
    const {models, query} = digs(this.collection, "models", "query")
    const ColumnInHeadComponent = this.columnInHeadComponent()
    const RowComponent = this.rowComponent()

    let BodyComponent, HeadComponent

    if (this.isSmallScreen()) {
      BodyComponent = "div"
      HeadComponent = "div"
    } else {
      BodyComponent = "tbody"
      HeadComponent = "thead"
    }

    return (
      <>
        <HeadComponent>
          <RowComponent className="live-table-header-row">
            {workplace && currentWorkplace &&
              <ColumnInHeadComponent style={{width: 25, textAlign: "center"}}>
                <WorkerPluginsCheckAllCheckbox currentWorkplace={currentWorkplace} query={query} />
              </ColumnInHeadComponent>
            }
            {this.headersContentFromColumns()}
            <ColumnInHeadComponent />
          </RowComponent>
        </HeadComponent>
        <BodyComponent>
          {models.map((model) =>
            <ModelRow
              cacheKey={model.cacheKey()}
              columnComponent={this.columnComponent()}
              key={model.id()}
              liveTable={this}
              model={model}
              preparedColumns={preparedColumns}
              rowComponent={this.rowComponent()}
              tableSettingFullCacheKey={tableSettingFullCacheKey}
            />
          )}
        </BodyComponent>
      </>
    )
  }

  tableFooter() {
    const {result} = digs(this.collection, "result")
    const currentPage = result.currentPage()
    const totalCount = result.totalCount()
    const perPage = result.perPage()
    const to = Math.min(currentPage * perPage, totalCount)
    const defaultValue = "Showing %{from} to %{to} out of %{total_count} total"
    let from = ((currentPage - 1) * perPage) + 1

    if (to === 0) from = 0

    return (
      <div style={{display: "flex", justifyContent: "space-between", marginTop: "10px"}}>
        <div className="showing-counts">
          {I18n.t("js.api_maker.table.showing_from_to_out_of_total", {defaultValue, from, to, total_count: totalCount})}
        </div>
        <div>
          <Select
            className="per-page-select"
            defaultValue={perPage}
            onChange={this.tt.onPerPageChanged}
            options={paginationOptions}
          />
        </div>
      </div>
    )
  }

  className() {
    const classNames = ["api-maker--table"]

    if (this.props.className)
      classNames.push(this.props.className)

    return classNames.join(" ")
  }

  columnProps(column) {
    const props = {}

    if (column.textCenter) props["data-text-align"] = "center"
    if (column.textRight) props["data-text-align"] = "right"

    return props
  }

  isSmallScreen() {
    if (this.breakpoint == "xs" || this.breakpoint == "sm") return true

    return false
  }

  columnComponent = () => this.responsiveComponent("td")
  columnInHeadComponent = () => this.responsiveComponent("th")
  responsiveComponent = (largeComponent) => this.isSmallScreen() ? "div" : largeComponent
  rowComponent = () => this.responsiveComponent("tr")

  headersContentFromColumns = () => this.s.preparedColumns?.map(({column, tableSettingColumn}) => columnVisible(column, tableSettingColumn) &&
    <HeaderColumn
      column={column}
      fixedTableLayout={this.s.fixedTableLayout}
      key={tableSettingColumn.identifier()}
      table={this}
      tableSettingColumn={tableSettingColumn}
    />
  )

  headerClassNameForColumn (column) {
    const classNames = ["live-table-header"]

    if (column.commonProps && column.commonProps.className) classNames.push(column.commonProps.className)
    if (column.headerProps && column.headerProps.className) classNames.push(column.headerProps.className)

    return classNames
  }

  headerLabelForColumn (column) {
    const {modelClass} = this.p

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

        currentModelClass = modelClassRequire(digg(relationship, "resource_name"))
      }
    }

    if (column.attribute) return currentModelClass.humanAttributeName(column.attribute)

    throw new Error("No 'label' or 'attribute' was given")
  }

  onFilterFormSubmit = (e) => {
    e.preventDefault()
    this.submitFilter()
  }

  onRequestCloseSettings = () => this.setState({showSettings: false})

  onSettingsClicked = (e) => {
    e.preventDefault()

    const {showSettings} = this.s

    this.setState({showSettings: !showSettings})
  }

  submitFilter = () => {
    const filterForm = digg(this.tt.filterFormRef, "current")
    const {appHistory} = this.props
    const qParams = Params.serializeForm(filterForm)
    const {queryQName} = this.s
    const changeParamsParams = {}

    changeParamsParams[queryQName] = JSON.stringify(qParams)

    Params.changeParams(changeParamsParams, {appHistory})
  }

  submitFilterDebounce = debounce(this.tt.submitFilter)
}))
