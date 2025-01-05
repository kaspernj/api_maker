import {digg, digs} from "diggerize"
import React, {createContext, useContext, useMemo, useRef} from "react"
import {Animated, Pressable, View} from "react-native"
import BaseComponent from "../base-component"
import Card from "../bootstrap/card"
import classNames from "classnames"
import Collection from "../collection"
import columnVisible from "./column-visible.mjs"
import debounce from "debounce"
import DraggableSort from "../draggable-sort/index.jsx"
import EventEmitter from "events"
import Filters from "./filters"
import FlatList from "./components/flat-list"
import FontAwesomeIcon from "react-native-vector-icons/FontAwesome"
import {Form} from "../form"
import Header from "./components/header"
import HeaderColumn from "./header-column"
import HeaderSelect from "./header-select"
import * as inflection from "inflection"
import memo from "set-state-compare/src/memo"
import modelClassRequire from "../model-class-require.mjs"
import ModelRow from "./model-row"
import Paginate from "../bootstrap/paginate"
import Params from "../params"
import PropTypes from "prop-types"
import Row from "./components/row"
import selectCalculator from "./select-calculator"
import Select from "../inputs/select"
import Settings from "./settings"
import {shapeComponent} from "set-state-compare/src/shape-component"
import TableSettings from "./table-settings"
import Text from "../utils/text"
import uniqunize from "uniqunize"
import useBreakpoint from "../use-breakpoint"
import useCollection from "../use-collection"
import useI18n from "i18n-on-steroids/src/use-i18n.mjs"
import useEventEmitter from "../use-event-emitter.mjs"
import useModelEvent from "../use-model-event.js"
import useQueryParams from "on-location-changed/src/use-query-params.js"
import Widths from "./widths"

const paginationOptions = [30, 60, 90, ["All", "all"]]
const WorkerPluginsCheckAllCheckbox = React.lazy(() => import("./worker-plugins-check-all-checkbox"))
const TableContext = createContext()

const ListHeaderComponent = memo(shapeComponent(class ListHeaderComponent extends BaseComponent {
  setup() {
    this.useStates({
      lastUpdate: new Date()
    })
  }

  render() {
    const {mdUp} = useBreakpoint()
    const tableContextValue = useContext(TableContext)
    const table = tableContextValue.table
    const {collection, events, queryWithoutPagination, t} = table.tt
    const {query} = digs(collection, "query")

    useEventEmitter(events, "columnVisibilityUpdated", this.tt.onColumnVisibilityUpdated)

    return (
      <Row dataSet={{class: "api-maker/table/header-row"}} style={table.styleForRowHeader()}>
        {table.p.workplace && table.s.currentWorkplace &&
          <Header style={table.styleForHeader({style: {width: mdUp ? 41 : undefined}})}>
            <WorkerPluginsCheckAllCheckbox
              currentWorkplace={table.s.currentWorkplace}
              query={queryWithoutPagination}
              style={{marginHorizontal: "auto"}}
            />
            {!mdUp &&
              <Text style={{marginLeft: 3}}>
                {t(".select_all_found", {defaultValue: "Select all found"})}
              </Text>
            }
          </Header>
        }
        {!mdUp &&
          <Header style={table.styleForHeader({style: {}})}>
            <HeaderSelect preparedColumns={table.s.preparedColumns} query={query} table={table} />
          </Header>
        }
        {mdUp &&
          <>
            {table.headersContentFromColumns()}
            <Header style={table.styleForHeader({style: {}, type: "actions"})} />
          </>
        }
      </Row>
    )
  }

  onColumnVisibilityUpdated = () => this.setState({lastUpdate: new Date()})
}))

export default memo(shapeComponent(class ApiMakerTable extends BaseComponent {
  static defaultProps = {
    card: true,
    currentUser: null,
    destroyEnabled: true,
    filterCard: true,
    filterSubmitButton: true,
    noRecordsAvailableContent: undefined,
    noRecordsFoundContent: undefined,
    preloads: [],
    select: {},
    styleUI: true,
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
    styleUI: PropTypes.bool.isRequired,
    viewModelPath: PropTypes.func,
    workplace: PropTypes.bool.isRequired
  }

  draggableSortEvents = new EventEmitter()
  events = new EventEmitter()
  tableSettings = null

  setup() {
    const {t} = useI18n({namespace: "js.api_maker.table"})
    const {name: breakpoint, mdUp} = useBreakpoint()
    const queryParams = useQueryParams()

    this.setInstance({
      breakpoint,
      filterFormRef: useRef(),
      mdUp,
      t
    })

    const collectionKey = digg(this.p.modelClass.modelClassData(), "collectionKey")
    let queryName = this.props.queryName

    if (!queryName) queryName = collectionKey

    const querySName = `${queryName}_s`

    this.useStates({
      columns: () => this.columnsAsArray(),
      currentWorkplace: undefined,
      currentWorkplaceCount: null,
      filterForm: null,
      columnsToShow: null,
      draggedColumn: null,
      identifier: () => this.props.identifier || `${collectionKey}-default`,
      lastUpdate: () => new Date(),
      preload: undefined,
      preparedColumns: undefined,
      queryName,
      queryQName: () => `${queryName}_q`,
      queryPageName: () => `${queryName}_page`,
      querySName,
      resizing: false,
      showFilters: () => Boolean(queryParams[querySName]),
      showSettings: false,
      tableSetting: undefined,
      tableSettingLoaded: false,
      tableSettingFullCacheKey: undefined,
      width: undefined,
      widths: null
    })

    this.tableContextValue = useMemo(
      () => ({
        cacheKey: this.s.tableSettingFullCacheKey,
        lastUpdate: this.s.lastUpdate,
        resizing: this.s.resizing,
        table: this
      }),
      [this.s.lastUpdate, this.s.resizing, this.s.tableSettingFullCacheKey]
    )

    useMemo(() => {
      if (this.props.workplace) {
        this.loadCurrentWorkplace().then(() => {
          this.loadCurrentWorkplaceCount()
        })
      }
    }, [this.p.currentUser?.id()])

    useMemo(() => {
      if (!this.tt.tableSettings && this.s.width) {
        this.loadTableSetting()
      }
    }, [this.p.currentUser?.id(), this.s.width])

    useModelEvent(this.s.currentWorkplace, "workplace_links_created", this.tt.onLinksCreated)
    useModelEvent(this.s.currentWorkplace, "workplace_links_destroyed", this.tt.onLinksDestroyed)

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
    this.queryWithoutPagination = useMemo(
      () => this.collection?.query?.clone()?.except("page"),
      [this.collection.query]
    )

    useEventEmitter(this.tt.draggableSortEvents, "onDragStart", this.tt.onDragStart)
    useEventEmitter(this.tt.draggableSortEvents, "onDragEndAnimation", this.tt.onDragEndAnimation)
    useEventEmitter(this.tt.events, "columnVisibilityUpdated", this.tt.onColumnVisibilityUpdated)
  }

  onColumnVisibilityUpdated = () => this.setState({columnsToShow: this.getColumnsToShow(this.s.columns), lastUpdate: new Date()})
  onDragStart = ({item}) => item.animatedZIndex.setValue(9999)
  onDragEndAnimation = ({item}) => item.animatedZIndex.setValue(0)

  async loadCurrentWorkplace() {
    const Workplace = modelClassRequire("Workplace")
    const result = await Workplace.current()
    const currentWorkplace = digg(result, "current", 0)

    this.setState({currentWorkplace})
  }

  async loadCurrentWorkplaceCount() {
    const WorkplaceLink = modelClassRequire("WorkplaceLink")
    const currentWorkplaceCount = await WorkplaceLink
      .ransack({
        resource_type_eq: this.p.modelClass.modelClassData().name,
        workplace_id_eq: this.s.currentWorkplace.id()
      })
      .count()

    this.setState({currentWorkplaceCount})
  }

  getColumnsToShow(columns) {
    return columns
      .filter(({column, tableSettingColumn}) => columnVisible(column, tableSettingColumn))
      .sort((a, b) => a.tableSettingColumn.position() - b.tableSettingColumn.position())
  }

  async loadTableSetting() {
    this.tableSettings = new TableSettings({table: this})

    const tableSetting = await this.tableSettings.loadExistingOrCreateTableSettings()
    const {columns, preload} = this.tableSettings.preparedColumns(tableSetting)
    const {width} = this.s
    const widths = new Widths({columns, table: this, width})
    const columnsToShow = this.getColumnsToShow(columns)

    this.setState({
      columns,
      columnsToShow,
      preparedColumns: columns,
      preload: this.mergedPreloads(preload),
      tableSetting,
      tableSettingLoaded: true,
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
      <View dataSet={{class: this.className()}} onLayout={this.tt.onContainerLayout} style={this.props.styles?.container}>
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
      </View>
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
      styleUI,
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

    const flatListStyle = {
      overflowX: "auto"
    }

    if (styleUI) {
      flatListStyle.border = "1px solid #dbdbdb"
      flatListStyle.borderRadius = 5
    }

    const flatList = (
      <TableContext.Provider value={this.tt.tableContextValue}>
        <FlatList
          data={models}
          dataSet={{
            class: classNames("api-maker--table", className),
            cacheKey: this.s.tableSettingFullCacheKey,
            lastUpdate: this.s.lastUpdate
          }}
          extraData={this.s.lastUpdate}
          keyExtractor={this.tt.keyExtrator}
          ListHeaderComponent={ListHeaderComponent}
          renderItem={this.tt.renderItem}
          showsHorizontalScrollIndicator
          style={flatListStyle}
          {...restProps}
        />
      </TableContext.Provider>
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

  onContainerLayout = (e) => {
    const {width} = e.nativeEvent.layout
    const {widths} = this.s

    this.setState({width})
    if (widths) widths.tableWidth = width
  }

  onLinksCreated = ({args}) => {
    const modelClassName = this.p.modelClass.modelClassData().name

    if (args.created[modelClassName]) {
      const amountCreated = args.created[modelClassName].length

      this.setState((prevState) => ({
        currentWorkplaceCount: prevState.currentWorkplaceCount + amountCreated
      }))
    }
  }

  onLinksDestroyed = ({args}) => {
    const modelClassName = this.p.modelClass.modelClassData().name

    if (args.destroyed[modelClassName]) {
      const amountDestroyed = args.destroyed[modelClassName].length

      this.setState((prevState) => ({
        currentWorkplaceCount: prevState.currentWorkplaceCount - amountDestroyed
      }))
    }
  }

  keyExtrator = (model) => `${this.s.tableSettingFullCacheKey}-${model.id()}`

  filterForm = () => {
    const {filterFormRef, submitFilter, submitFilterDebounce} = this.tt
    const {filterContent, filterSubmitButton} = this.p
    const {queryQName} = this.s
    const {filterSubmitLabel} = this.props
    const {qParams} = digs(this.collection, "qParams")

    return (
      <Form className="live-table--filter-form" formRef={filterFormRef} onSubmit={this.tt.onFilterFormSubmit} setForm={this.setStates.filterForm}>
        {"s" in qParams &&
          <input name="s" type="hidden" value={qParams.s} />
        }
        {filterContent({
          onFilterChanged: submitFilter,
          onFilterChangedWithDelay: submitFilterDebounce,
          qParams,
          queryQName
        })}
        {filterSubmitButton &&
          <input
            className="btn btn-primary live-table--submit-filter-button"
            type="submit"
            style={{marginTop: "8px"}}
            value={filterSubmitLabel || this.t(".filter", {defaultValue: "Filter"})}
          />
        }
      </Form>
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

  renderItem = ({index, item: model}) => {
    if (!this.s.tableSettingLoaded) {
      return (
        <View>
          <Text>
            {this.t(".loading_dot_dot_dot", {defaultValue: "Loading..."})}
          </Text>
        </View>
      )
    }

    return (
      <ModelRow
        cacheKey={model.cacheKey()}
        columns={this.s.columnsToShow}
        columnWidths={this.columnWidths()}
        events={this.tt.events}
        index={index}
        key={model.id()}
        model={model}
        table={this}
        tableSettingFullCacheKey={this.s.tableSettingFullCacheKey}
      />
    )
  }

  styleForColumn = ({column, columnIndex, even, style, type}) => {
    const {styleUI} = this.p
    const defaultStyle = {
      justifyContent: "center",
      padding: 8,
      overflow: "hidden"
    }

    if (styleUI) {
      Object.assign(defaultStyle, {
        backgroundColor: even ? "#f5f5f5" : "#fff"
      })
    }

    if (type == "actions") {
      defaultStyle.flexDirection = "row"
      defaultStyle.alignItems = "center"

      if (this.tt.mdUp) {
        defaultStyle.marginLeft = "auto"
      } else {
        defaultStyle.marginRight = "auto"
      }
    } else if (this.tt.mdUp && styleUI) {
      defaultStyle.borderRight = "1px solid #dbdbdb"
    }

    const actualStyle = Object.assign(
      defaultStyle,
      style
    )

    return actualStyle
  }

  styleForHeader = ({column, columnIndex, style, type}) => {
    const {mdUp} = this.tt
    const defaultStyle = {
      flexDirection: "row",
      alignItems: "center",
      padding: 8
    }

    if (type != "actions" && mdUp && this.p.styleUI) {
      defaultStyle.borderRight = "1px solid #dbdbdb"
    }

    const actualStyle = Object.assign(
      defaultStyle,
      style
    )

    return actualStyle
  }

  styleForHeaderText() {
    const actualStyle = {fontWeight: "bold"}

    return actualStyle
  }

  styleForRow = ({even} = {}) => {
    const actualStyle = {
      flex: 1,
      alignItems: "stretch"
    }

    if (even && this.p.styleUI) {
      actualStyle.backgroundColor = "#f5f5f5"
    }

    return actualStyle
  }

  styleForRowHeader = () => {
    const actualStyle = {
      flex: 1,
      alignItems: "stretch"
    }

    return actualStyle
  }

  tableControls() {
    const {controls} = this.props
    const {showSettings} = this.s
    const {models, qParams, query, result} = digs(this.collection, "models", "qParams", "query", "result")

    return (
      <View style={{flexDirection: "row"}}>
        {controls && controls({models, qParams, query, result})}
        <Pressable dataSet={{class: "filter-button"}} onPress={this.tt.onFilterClicked}>
          <FontAwesomeIcon name="search" size={20} />
        </Pressable>
        <View style={{position: "relative"}}>
          {showSettings &&
            <Settings onRequestClose={this.tt.onRequestCloseSettings} table={this} />
          }
          <Pressable dataSet={{class: "settings-button"}} onPress={this.tt.onSettingsClicked}>
            <FontAwesomeIcon name="gear" size={20} />
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
    const defaultValue = "Showing %{from} to %{to} out of %{total_count} total."
    let from = ((currentPage - 1) * perPage) + 1

    if (to === 0) from = 0

    return (
      <View style={{flexDirection: "row", justifyContent: "space-between", marginTop: 10}}>
        <View dataSet={{class: "showing-counts"}} style={{flexDirection: "row"}}>
          <Text>
            {this.t(".showing_from_to_out_of_total", {defaultValue, from, to, total_count: totalCount})}
          </Text>
          {this.p.workplace && this.s.currentWorkplaceCount !== null &&
            <Text style={{marginLeft: 3}}>
              {this.t(".x_selected", {defaultValue: "%{selected} selected.", selected: this.s.currentWorkplaceCount})}
            </Text>
          }
        </View>
        <View>
          <Select
            className="per-page-select"
            defaultValue={perPage}
            onChange={this.tt.onPerPageChanged}
            options={paginationOptions}
          />
        </View>
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

    if (column.textCenter) {
      props.style ||= {}
      props.style.textAlign = "center"
    }

    if (column.textRight) {
      props.style ||= {}
      props.style.textAlign = "right"
    }

    return props
  }

  headerProps(column) {
    const props = {}

    if (column.textCenter) {
      props.style ||= {}
      props.style.justifyContent = "center"
    }

    if (column.textRight) {
      props.style ||= {}
      props.style.justifyContent = "end"
    }

    return props
  }

  columnWidths() {
    const columnWidths = {}

    for (const column of this.s.preparedColumns) {
      columnWidths[column.tableSettingColumn.identifier()] = column.width
    }

    return columnWidths
  }

  headersContentFromColumns = () => {
    return (
      <DraggableSort
        data={this.s.columnsToShow}
        events={this.tt.draggableSortEvents}
        horizontal
        keyExtractor={this.tt.dragListkeyExtractor}
        onItemMoved={this.tt.onItemMoved}
        onReordered={this.tt.onReordered}
        renderItem={this.tt.dragListRenderItemContent}
      />
    )
  }

  dragListCacheKeyExtractor = (item) => `${item.tableSettingColumn.identifier()}-${this.s.resizing}`
  dragListkeyExtractor = (item) => item.tableSettingColumn.identifier()

  onItemMoved = ({animationArgs, itemIndex, x, y}) => {
    const animatedPosition = digg(this, "s", "columnsToShow", itemIndex, "animatedPosition")

    if (animationArgs) {
      Animated.timing(animatedPosition, animationArgs).start()
    } else {
      animatedPosition.setValue({x, y})
    }
  }

  onReordered = async ({fromItem, fromPosition, toItem, toPosition}) => {
    if (fromPosition == toPosition) return // Only do requests and queries if changed

    const TableSettingColumn = fromItem.tableSettingColumn.constructor
    const toColumn = await TableSettingColumn.find(toItem.tableSettingColumn.id()) // Need to load latest position because ActsAsList might have changed it

    await fromItem.tableSettingColumn.update({position: toColumn.position()})
  }

  dragListRenderItemContent = ({isActive, item, touchProps}) => {
    const {animatedWidth, animatedZIndex, column, tableSettingColumn} = item

    return (
      <HeaderColumn
        active={isActive}
        animatedWidth={animatedWidth}
        animatedZIndex={animatedZIndex}
        column={column}
        key={tableSettingColumn.identifier()}
        resizing={this.s.resizing}
        table={this}
        tableSettingColumn={tableSettingColumn}
        touchProps={touchProps}
        widths={this.s.widths}
      />
    )
  }

  headerClassNameForColumn(column) {
    const classNames = []

    if (column.commonProps && column.commonProps.className) classNames.push(column.commonProps.className)
    if (column.headerProps && column.headerProps.className) classNames.push(column.headerProps.className)

    return classNames
  }

  headerLabelForColumn(column) {
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

  onFilterFormSubmit = () => this.submitFilter()
  onRequestCloseSettings = () => this.setState({showSettings: false})

  onSettingsClicked = (e) => {
    e.preventDefault()

    this.setState({showSettings: !this.s.showSettings})
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
