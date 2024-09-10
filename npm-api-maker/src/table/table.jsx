import "./style"
import {digg, digs} from "diggerize"
import {Pressable, View} from "react-native"
import BaseComponent from "../base-component"
import Card from "../bootstrap/card"
import classNames from "classnames"
import Collection from "../collection"
import columnVisible from "./column-visible.mjs"
import debounce from "debounce"
import Filters from "./filters"
import FlatList from "./components/flat-list"
import Header from "./components/header"
import HeaderColumn from "./header-column"
import Icon from "../icon"
import * as inflection from "inflection"
import modelClassRequire from "../model-class-require.mjs"
import ModelRow from "./model-row"
import Paginate from "../bootstrap/paginate"
import Params from "../params"
import PropTypes from "prop-types"
import React, {memo, useMemo, useRef} from "react"
import Row from "./components/row"
import selectCalculator from "./select-calculator"
import Select from "../inputs/select"
import Settings from "./settings"
import {shapeComponent} from "set-state-compare/src/shape-component"
import TableSettings from "./table-settings"
import uniqunize from "uniqunize"
import useBreakpoint from "../use-breakpoint"
import useCollection from "../use-collection"
import useQueryParams from "on-location-changed/src/use-query-params.js"
import Widths from "./widths"

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
    styles: PropTypes.object,
    viewModelPath: PropTypes.func,
    workplace: PropTypes.bool.isRequired
  }

  setup() {
    const {breakpoint} = useBreakpoint()
    const queryParams = useQueryParams()

    this.setInstance({
      breakpoint,
      filterFormRef: useRef(),
      isSmallScreen: breakpoint == "xs" || breakpoint == "sm"
    })

    const collectionKey = digg(this.p.modelClass.modelClassData(), "collectionKey")
    let queryName = this.props.queryName

    if (!queryName) queryName = collectionKey

    const columnsAsArray = this.columnsAsArray()
    const querySName = `${queryName}_s`

    this.useStates({
      columns: columnsAsArray,
      currentWorkplace: undefined,
      flatListWidth: undefined,
      identifier: () => this.props.identifier || `${collectionKey}-default`,
      lastUpdate: () => new Date(),
      preload: undefined,
      preparedColumns: undefined,
      queryName,
      queryQName: () => `${queryName}_q`,
      queryPageName: () => `${queryName}_page`,
      querySName,
      showFilters: () => Boolean(queryParams[querySName]),
      showSettings: false,
      tableSetting: undefined,
      tableSettingFullCacheKey: undefined,
      widths: null
    })

    useMemo(() => {
      this.loadTableSetting()

      if (this.props.workplace) {
        this.loadCurrentWorkplace()
      }
    }, [])

    let collectionReady = true
    let select

    if (!this.s.preparedColumns) {
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
    const {flatListWidth} = this.s
    const widths = new Widths({columns, flatListWidth, table: this})

    this.setState({
      preparedColumns: columns,
      preload: this.mergedPreloads(preload),
      tableSetting,
      tableSettingFullCacheKey: tableSetting.fullCacheKey(),
      widths
    })
  }

  updateSettingsFullCacheKey = () => this.setState({tableSettingFullCacheKey: this.state.tableSetting.fullCacheKey()})

  columnsAsArray = () => {
    if (typeof this.props.columns == "function") {
      return this.props.columns()
    }

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
      <div className={this.className()} style={this.props.styles?.container}>
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

    const flatList = (
      <FlatList
        data={models}
        dataSet={{class: className}}
        extraData={this.s.lastUpdate}
        keyExtractor={this.tt.keyExtrator}
        ListHeaderComponent={this.tt.listHeaderComponent}
        onLayout={this.tt.onFlatListLayout}
        renderItem={this.tt.renderItem}
        {...restProps}
      />
    )

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
          <Card
            className={classNames("live-table--table-card", "mb-4", className)}
            controls={this.tableControls()}
            header={headerContent}
            footer={this.tableFooter()}
            {...restProps}
          >
            {flatList}
          </Card>
        }
        {!card && flatList}
        {result && PaginationComponent &&
          <PaginationComponent result={result} />
        }
        {result && paginateContent &&
          paginateContent({result})
        }
      </>
    )
  }

  onFlatListLayout = (e) => {
    const {width} = e.nativeEvent.layout
    const {widths} = this.s

    this.setState({flatListWidth: width})
    widths.flatListWidth = width
  }

  keyExtrator = (model) => model.id()

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

  onPerPageChanged = (e) => {
    const {queryName} = this.s
    const newPerPageValue = digg(e, "target", "value")
    const perKey = `${queryName}_per`
    const paramsChange = {}

    paramsChange[perKey] = newPerPageValue

    Params.changeParams(paramsChange)
  }

  listHeaderComponent = () => {
    const {workplace} = this.p
    const {currentWorkplace} = this.s
    const {query} = digs(this.collection, "query")

    return (
      <Row dataSet={{class: "live-table-header-row"}}>
        {workplace && currentWorkplace &&
          <Header style={{width: 25}}>
            <WorkerPluginsCheckAllCheckbox
              currentWorkplace={currentWorkplace}
              query={query}
              style={{marginHorizontal: "auto"}}
            />
          </Header>
        }
        {this.headersContentFromColumns()}
        <Header />
      </Row>
    )
  }

  renderItem = ({item: model}) => {
    const {preparedColumns, tableSettingFullCacheKey} = this.s

    return (
      <ModelRow
        cacheKey={model.cacheKey()}
        columnWidths={this.columnWidths()}
        isSmallScreen={this.tt.isSmallScreen}
        key={model.id()}
        liveTable={this}
        model={model}
        preparedColumns={preparedColumns}
        tableSettingFullCacheKey={tableSettingFullCacheKey}
      />
    )
  }

  tableControls() {
    const {controls} = this.props
    const {showSettings} = this.s
    const {models, qParams, query, result} = digs(this.collection, "models", "qParams", "query", "result")

    return (
      <View style={{flexDirection: "row"}}>
        {controls && controls({models, qParams, query, result})}
        <Pressable dataSet={{class: "filter-button"}} onPress={this.tt.onFilterClicked}>
          <Icon icon="magnifying-glass-solid" />
        </Pressable>
        <View style={{position: "relative"}}>
          {showSettings &&
            <Settings onRequestClose={this.tt.onRequestCloseSettings} table={this} />
          }
          <Pressable dataSet={{class: "settings-button"}} onPress={this.tt.onSettingsClicked}>
            <Icon icon="gear-solid" />
          </Pressable>
        </View>
      </View>
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
      <View style={{flexDirection: "row", justifyContent: "space-between", marginTop: "10px"}}>
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
      </View>
    )
  }

  className() {
    const classNames = ["api-maker--table"]

    if (this.props.className) {
      classNames.push(this.props.className)
    }

    return classNames.join(" ")
  }

  columnProps(column) {
    const props = {}

    if (column.textCenter) props["data-text-align"] = "center"
    if (column.textRight) props["data-text-align"] = "right"

    return props
  }

  columnWidths() {
    const columnWidths = {}

    for (const column of this.s.preparedColumns) {
      columnWidths[column.tableSettingColumn.identifier()] = column.width
    }

    return columnWidths
  }

  headersContentFromColumns = () => this.s.preparedColumns?.map(({column, tableSettingColumn, width}) => columnVisible(column, tableSettingColumn) &&
    <HeaderColumn
      column={column}
      key={tableSettingColumn.identifier()}
      table={this}
      tableSettingColumn={tableSettingColumn}
      width={width}
      widths={this.s.widths}
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
