import { digg, digs } from "diggerize";
import React, { createContext, useContext, useMemo, useRef } from "react";
import { Animated, Platform, Pressable, View } from "react-native";
import BaseComponent from "../base-component.js";
import Card from "../bootstrap/card.js";
import classNames from "classnames";
import Collection from "../collection.js";
import columnVisible from "./column-visible.js";
import debounce from "debounce";
import DraggableSort from "../draggable-sort/index.js";
import { EventEmitter } from "eventemitter3";
import Filters from "./filters/index.js";
import FlatList from "./components/flat-list.js";
import { Form } from "../form.js";
import Header from "./components/header.js";
import HeaderColumn from "./header-column.js";
import HeaderSelect from "./header-select.js";
import Icon from "../utils/icon.js";
import { incorporate } from "incorporator";
import * as inflection from "inflection";
import memo from "set-state-compare/build/memo.js";
import modelClassRequire from "../model-class-require.js";
import ModelRow from "./model-row.js";
import Paginate from "../bootstrap/paginate.js";
import Params from "../params.js";
import PropTypes from "prop-types";
import Row from "./components/row.js";
import selectCalculator from "./select-calculator.js";
import Select from "../inputs/select.js";
import Settings from "./settings/index.js";
import { shapeComponent } from "set-state-compare/build/shape-component.js";
import TableSettings from "./table-settings.js";
import Text from "../utils/text.js";
import uniqunize from "uniqunize";
import useBreakpoint from "../use-breakpoint.js";
import useCollection from "../use-collection.js";
import useI18n from "i18n-on-steroids/src/use-i18n.mjs";
import useEventEmitter from "../use-event-emitter.js";
import useModelEvent from "../use-model-event.js";
import useQueryParams from "on-location-changed/build/use-query-params.js";
import Widths from "./widths.js";
import WorkerPluginsCheckAllCheckbox from "./worker-plugins-check-all-checkbox.js";
const paginationOptions = [30, 60, 90, ["All", "all"]];
const TableContext = createContext();
const ListHeaderComponent = memo(shapeComponent(class ListHeaderComponent extends BaseComponent {
    setup() {
        this.useStates({
            lastUpdate: new Date()
        });
    }
    render() {
        const { mdUp } = useBreakpoint();
        const tableContextValue = useContext(TableContext);
        const table = tableContextValue.table;
        const { collection, events, queryWithoutPagination, t } = table.tt;
        const { query } = digs(collection, "query");
        useEventEmitter(events, "columnVisibilityUpdated", this.tt.onColumnVisibilityUpdated);
        return (<Row style={table.styleForRowHeader()} testID="api-maker/table/header-row">
        {table.p.workplace && table.s.currentWorkplace &&
                <Header style={table.styleForHeader({ style: { width: mdUp ? 41 : undefined } })}>
            <WorkerPluginsCheckAllCheckbox currentWorkplace={table.s.currentWorkplace} query={queryWithoutPagination} style={this.cache("workerPlguinsCheckAllCheckboxStyle", { marginHorizontal: "auto" })}/>
            {!mdUp &&
                        <Text style={this.cache("selectAllFoundTextStyle", { marginLeft: 3 })}>
                {t(".select_all_found", { defaultValue: "Select all found" })}
              </Text>}
          </Header>}
        {!mdUp &&
                <Header style={table.styleForHeader({ style: {} })}>
            <HeaderSelect preparedColumns={table.s.preparedColumns} query={query} table={table}/>
          </Header>}
        {mdUp &&
                <>
            {table.headersContentFromColumns()}
            <Header style={table.styleForHeader({ style: {}, type: "actions" })}/>
          </>}
      </Row>);
    }
    onColumnVisibilityUpdated = () => this.setState({ lastUpdate: new Date() });
}));
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
    };
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
        filterSubmitLabel: PropTypes.any,
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
    };
    draggableSortEvents = new EventEmitter();
    events = new EventEmitter();
    tableSettings = null;
    setup() {
        const { t } = useI18n({ namespace: "js.api_maker.table" });
        const { name: breakpoint, mdUp } = useBreakpoint();
        const queryParams = useQueryParams();
        this.setInstance({
            breakpoint,
            filterFormRef: useRef(),
            mdUp,
            t
        });
        const collectionKey = digg(this.p.modelClass.modelClassData(), "collectionKey");
        let queryName = this.props.queryName;
        if (!queryName)
            queryName = collectionKey;
        const querySName = `${queryName}_s`;
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
        });
        this.tableContextValue = useMemo(() => ({
            cacheKey: this.s.tableSettingFullCacheKey,
            lastUpdate: this.s.lastUpdate,
            resizing: this.s.resizing,
            table: this
        }), [this.s.lastUpdate, this.s.resizing, this.s.tableSettingFullCacheKey]);
        useMemo(() => {
            if (this.props.workplace) {
                this.loadCurrentWorkplace().then(() => {
                    this.loadCurrentWorkplaceCount();
                });
            }
        }, [this.p.currentUser?.id()]);
        useMemo(() => {
            if (!this.tt.tableSettings && this.s.width) {
                this.loadTableSetting();
            }
        }, [this.p.currentUser?.id(), this.s.width]);
        useModelEvent(this.s.currentWorkplace, "workplace_links_created", this.tt.onLinksCreated);
        useModelEvent(this.s.currentWorkplace, "workplace_links_destroyed", this.tt.onLinksDestroyed);
        let collectionReady = true;
        let select;
        if (!this.s.preparedColumns) {
            collectionReady = false;
        }
        if (collectionReady) {
            select = selectCalculator({ table: this });
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
        });
        this.queryWithoutPagination = useMemo(() => this.collection?.query?.clone()?.except("page"), [this.collection.query]);
        useEventEmitter(this.tt.draggableSortEvents, "onDragStart", this.tt.onDragStart);
        useEventEmitter(this.tt.draggableSortEvents, "onDragEndAnimation", this.tt.onDragEndAnimation);
        useEventEmitter(this.tt.events, "columnVisibilityUpdated", this.tt.onColumnVisibilityUpdated);
    }
    onColumnVisibilityUpdated = () => this.setState({ columnsToShow: this.getColumnsToShow(this.s.columns), lastUpdate: new Date() });
    onDragStart = ({ item }) => item.animatedZIndex.setValue(9999);
    onDragEndAnimation = ({ item }) => item.animatedZIndex.setValue(0);
    async loadCurrentWorkplace() {
        const Workplace = modelClassRequire("Workplace");
        const result = await Workplace.current();
        const currentWorkplace = digg(result, "current", 0);
        this.setState({ currentWorkplace });
    }
    async loadCurrentWorkplaceCount() {
        const WorkplaceLink = modelClassRequire("WorkplaceLink");
        const currentWorkplaceCount = await WorkplaceLink
            .ransack({
            resource_type_eq: this.p.modelClass.modelClassData().name,
            workplace_id_eq: this.s.currentWorkplace.id()
        })
            .count();
        this.setState({ currentWorkplaceCount });
    }
    getColumnsToShow(columns) {
        return columns
            .filter(({ column, tableSettingColumn }) => columnVisible(column, tableSettingColumn))
            .sort((a, b) => a.tableSettingColumn.position() - b.tableSettingColumn.position());
    }
    async loadTableSetting() {
        this.tableSettings = new TableSettings({ table: this });
        const tableSetting = await this.tableSettings.loadExistingOrCreateTableSettings();
        const { columns, preload } = this.tableSettings.preparedColumns(tableSetting);
        const { width } = this.s;
        const widths = new Widths({ columns, table: this, width });
        const columnsToShow = this.getColumnsToShow(columns);
        this.setState({
            columns,
            columnsToShow,
            preparedColumns: columns,
            preload: this.mergedPreloads(preload),
            tableSetting,
            tableSettingLoaded: true,
            tableSettingFullCacheKey: tableSetting.fullCacheKey(),
            widths
        });
    }
    updateSettingsFullCacheKey = () => this.setState({ tableSettingFullCacheKey: this.state.tableSetting.fullCacheKey() });
    columnsAsArray = () => {
        if (typeof this.props.columns == "function") {
            return this.props.columns();
        }
        return this.props.columns;
    };
    mergedPreloads(preload) {
        const { preloads } = this.props;
        let mergedPreloads = [];
        if (preloads)
            mergedPreloads = mergedPreloads.concat(preloads);
        if (preload)
            mergedPreloads = mergedPreloads.concat(preload);
        return uniqunize(mergedPreloads);
    }
    render() {
        const { modelClass, noRecordsAvailableContent, noRecordsFoundContent } = this.p;
        const { collection, currentUser } = this.props;
        const { queryName, querySName, showFilters } = this.s;
        const { models, overallCount, qParams, query, result, showNoRecordsAvailableContent, showNoRecordsFoundContent } = digs(this.collection, "models", "overallCount", "qParams", "query", "result", "showNoRecordsAvailableContent", "showNoRecordsFoundContent");
        if (collection && collection.args.modelClass.modelClassData().name != modelClass.modelClassData().name) {
            throw new Error(`Model class from collection '${collection.args.modelClass.modelClassData().name}' ` +
                `didn't match model class on table: '${modelClass.modelClassData().name}'`);
        }
        return (<View dataSet={this.cache("rootViewDataSet", { class: this.className() }, [this.className()])} onLayout={this.tt.onContainerLayout} style={this.props.styles?.container}>
        {showNoRecordsAvailableContent &&
                <div className="live-table--no-records-available-content">
            {noRecordsAvailableContent({ models, qParams, overallCount })}
          </div>}
        {showNoRecordsFoundContent &&
                <div className="live-table--no-records-found-content">
            {noRecordsFoundContent({ models, qParams, overallCount })}
          </div>}
        {showFilters &&
                <Filters currentUser={currentUser} modelClass={modelClass} queryName={queryName} querySName={querySName}/>}
        {(() => {
                if (qParams && query && result && models && !showNoRecordsAvailableContent && !showNoRecordsFoundContent) {
                    return this.cardOrTable();
                }
                else {
                    return (<View>
                <Text>{this.t(".loading_dot_dot_dit", { defaultValue: "Loading..." })}</Text>
              </View>);
                }
            })()}
      </View>);
    }
    abilitiesToLoad() {
        const abilitiesToLoad = {};
        const { abilities, modelClass } = this.props;
        const ownAbilities = [];
        if (this.props.destroyEnabled)
            ownAbilities.push("destroy");
        if (this.props.editModelPath)
            ownAbilities.push("edit");
        if (this.props.viewModelPath)
            ownAbilities.push("show");
        if (ownAbilities.length > 0) {
            const modelClassName = digg(modelClass.modelClassData(), "name");
            abilitiesToLoad[modelClassName] = ownAbilities;
        }
        if (abilities) {
            for (const modelName in abilities) {
                if (!(modelName in abilitiesToLoad)) {
                    abilitiesToLoad[modelName] = [];
                }
                for (const ability of abilities[modelName]) {
                    abilitiesToLoad[modelName].push(ability);
                }
            }
        }
        return abilitiesToLoad;
    }
    cardOrTable() {
        const { abilities, actionsContent, appHistory, card, className, collection, columns, controls, currentUser, defaultDateFormatName, defaultDateTimeFormatName, defaultParams, destroyEnabled, destroyMessage, editModelPath, filterCard, filterContent, filterSubmitButton, filterSubmitLabel, groupBy, header, identifier, modelClass, noRecordsAvailableContent, noRecordsFoundContent, onModelsLoaded, paginateContent, paginationComponent, preloads, queryMethod, queryName, select, selectColumns, styleUI, viewModelPath, workplace, ...restProps } = this.props;
        const { models, qParams, query, result } = digs(this.collection, "models", "qParams", "query", "result");
        let headerContent, PaginationComponent;
        if (typeof header == "function") {
            headerContent = header({ models, qParams, query, result });
        }
        else if (header) {
            headerContent = header;
        }
        else {
            headerContent = modelClass.modelName().human({ count: 2 });
        }
        if (!paginateContent) {
            if (paginationComponent) {
                PaginationComponent = paginationComponent;
            }
            else {
                PaginationComponent = Paginate;
            }
        }
        const flatListStyle = {
            overflowX: "auto"
        };
        if (styleUI) {
            flatListStyle.border = "1px solid #dbdbdb";
            flatListStyle.borderRadius = 5;
        }
        const flatList = (<TableContext.Provider value={this.tt.tableContextValue}>
        <FlatList data={models} dataSet={{
                class: classNames("api-maker--table", className),
                cacheKey: this.s.tableSettingFullCacheKey,
                lastUpdate: this.s.lastUpdate
            }} extraData={this.s.lastUpdate} keyExtractor={this.tt.keyExtrator} ListHeaderComponent={ListHeaderComponent} renderItem={this.tt.renderItem} showsHorizontalScrollIndicator style={flatListStyle} {...restProps}/>
      </TableContext.Provider>);
        return (<>
        {filterContent && filterCard &&
                <Card className="live-table--filter-card mb-4">
            {this.filterForm()}
          </Card>}
        {filterContent && !filterCard &&
                this.filterForm()}
        {card &&
                <Card className={classNames("live-table--table-card", "mb-4", className)} controls={this.tableControls()} header={headerContent} footer={this.tableFooter()} {...restProps}>
            {flatList}
          </Card>}
        {!card && flatList}
        {result && PaginationComponent &&
                <PaginationComponent result={result}/>}
        {result && paginateContent &&
                paginateContent({ result })}
      </>);
    }
    onContainerLayout = (e) => {
        const { width } = e.nativeEvent.layout;
        const { widths } = this.s;
        this.setState({ width });
        if (widths)
            widths.tableWidth = width;
    };
    onLinksCreated = ({ args }) => {
        const modelClassName = this.p.modelClass.modelClassData().name;
        if (args.created[modelClassName]) {
            const amountCreated = args.created[modelClassName].length;
            this.setState((prevState) => ({
                currentWorkplaceCount: prevState.currentWorkplaceCount + amountCreated
            }));
        }
    };
    onLinksDestroyed = ({ args }) => {
        const modelClassName = this.p.modelClass.modelClassData().name;
        if (args.destroyed[modelClassName]) {
            const amountDestroyed = args.destroyed[modelClassName].length;
            this.setState((prevState) => ({
                currentWorkplaceCount: prevState.currentWorkplaceCount - amountDestroyed
            }));
        }
    };
    keyExtrator = (model) => `${this.s.tableSettingFullCacheKey}-${model.id()}`;
    filterForm = () => {
        const { filterFormRef, submitFilter, submitFilterDebounce } = this.tt;
        const { filterContent, filterSubmitButton } = this.p;
        const { queryQName } = this.s;
        const { filterSubmitLabel } = this.props;
        const { qParams } = digs(this.collection, "qParams");
        return (<Form className="live-table--filter-form" formRef={filterFormRef} onSubmit={this.tt.onFilterFormSubmit} setForm={this.setStates.filterForm}>
        {"s" in qParams &&
                <input name="s" type="hidden" value={qParams.s}/>}
        {filterContent({
                onFilterChanged: submitFilter,
                onFilterChangedWithDelay: submitFilterDebounce,
                qParams,
                queryQName
            })}
        {filterSubmitButton &&
                <input className="btn btn-primary live-table--submit-filter-button" type="submit" style={{ marginTop: "8px" }} value={filterSubmitLabel || this.t(".filter", { defaultValue: "Filter" })}/>}
      </Form>);
    };
    onFilterClicked = (e) => {
        e.preventDefault();
        this.setState({ showFilters: !this.state.showFilters });
    };
    onPerPageChanged = (e) => {
        const { queryName } = this.s;
        const newPerPageValue = digg(e, "target", "value");
        const perKey = `${queryName}_per`;
        const paramsChange = {};
        paramsChange[perKey] = newPerPageValue;
        Params.changeParams(paramsChange);
    };
    renderItem = ({ index, item: model }) => {
        if (!this.s.tableSettingLoaded) {
            return (<View>
          <Text>
            {this.t(".loading_dot_dot_dot", { defaultValue: "Loading..." })}
          </Text>
        </View>);
        }
        return (<ModelRow cacheKey={model.cacheKey()} columns={this.s.columnsToShow} columnWidths={this.columnWidths()} events={this.tt.events} index={index} key={model.id()} model={model} table={this} tableSettingFullCacheKey={this.s.tableSettingFullCacheKey}/>);
    };
    styleForColumn = ({ column, columnIndex, even, style, type }) => {
        const { styleUI } = this.p;
        const defaultStyle = {
            justifyContent: "center",
            padding: 8,
            overflow: "hidden"
        };
        if (styleUI) {
            Object.assign(defaultStyle, {
                backgroundColor: even ? "#f5f5f5" : "#fff"
            });
        }
        if (type == "actions") {
            defaultStyle.flexDirection = "row";
            defaultStyle.alignItems = "center";
            if (this.tt.mdUp) {
                defaultStyle.marginLeft = "auto";
            }
            else {
                defaultStyle.marginRight = "auto";
            }
        }
        else if (this.tt.mdUp && styleUI) {
            defaultStyle.borderRight = "1px solid #dbdbdb";
        }
        const actualStyle = Object.assign(defaultStyle, style);
        return actualStyle;
    };
    styleForHeader = ({ column, columnIndex, style, type }) => {
        const { mdUp } = this.tt;
        const defaultStyle = {
            flexDirection: "row",
            alignItems: "center",
            padding: 8
        };
        if (type != "actions" && mdUp && this.p.styleUI) {
            defaultStyle.borderRight = "1px solid #dbdbdb";
        }
        const actualStyle = Object.assign(defaultStyle, style);
        return actualStyle;
    };
    styleForHeaderText() {
        const actualStyle = { fontWeight: "bold" };
        return actualStyle;
    }
    styleForRow = ({ even } = {}) => {
        const actualStyle = {
            flex: 1,
            alignItems: "stretch"
        };
        if (even && this.p.styleUI) {
            actualStyle.backgroundColor = "#f5f5f5";
        }
        return actualStyle;
    };
    styleForRowHeader = () => {
        const actualStyle = {
            flex: 1,
            alignItems: "stretch"
        };
        return actualStyle;
    };
    tableControls() {
        const { controls } = this.props;
        const { showSettings } = this.s;
        const { models, qParams, query, result } = digs(this.collection, "models", "qParams", "query", "result");
        return (<View style={this.cache("tableControlsRootViewStyle", { flexDirection: "row" })}>
        {controls && controls({ models, qParams, query, result })}
        <Pressable dataSet={{ class: "filter-button" }} onPress={this.tt.onFilterClicked}>
          <Icon name="search" size={20}/>
        </Pressable>
        <View>
          {showSettings &&
                <Settings onRequestClose={this.tt.onRequestCloseSettings} table={this}/>}
          <Pressable dataSet={this.cache("settingsButtonDataSet", { class: "settings-button" })} onPress={this.tt.onSettingsClicked}>
            <Icon name="gear" size={20}/>
          </Pressable>
        </View>
      </View>);
    }
    tableFooter() {
        const { result } = digs(this.collection, "result");
        const currentPage = result.currentPage();
        const totalCount = result.totalCount();
        const perPage = result.perPage();
        const to = Math.min(currentPage * perPage, totalCount);
        const defaultValue = "Showing %{from} to %{to} out of %{total_count} total.";
        let from = ((currentPage - 1) * perPage) + 1;
        if (to === 0)
            from = 0;
        return (<View style={this.cache("tableFooterRootViewStyle", { flexDirection: "row", justifyContent: "space-between", marginTop: 10 })}>
        <View dataSet={this.cache("showingCountsDataSet", { class: "showing-counts" })} style={this.cache("showingCountsStyle", { flexDirection: "row" })}>
          <Text>
            {this.t(".showing_from_to_out_of_total", { defaultValue, from, to, total_count: totalCount })}
          </Text>
          {this.p.workplace && this.s.currentWorkplaceCount !== null &&
                <Text style={this.cache("xSelectedTextStyle", { marginLeft: 3 })}>
              {this.t(".x_selected", { defaultValue: "%{selected} selected.", selected: this.s.currentWorkplaceCount })}
            </Text>}
        </View>
        <View>
          <Select className="per-page-select" defaultValue={perPage} onChange={this.tt.onPerPageChanged} options={paginationOptions}/>
        </View>
      </View>);
    }
    className() {
        const classNames = ["api-maker--table"];
        if (this.props.className) {
            classNames.push(this.props.className);
        }
        return classNames.join(" ");
    }
    columnProps(column) {
        const props = {};
        if (column.textCenter) {
            props.style ||= {};
            props.style.textAlign = "center";
        }
        if (column.textRight) {
            props.style ||= {};
            props.style.textAlign = "right";
        }
        return props;
    }
    headerProps(column) {
        const props = {};
        if (column.textCenter) {
            props.style ||= {};
            props.style.justifyContent = "center";
        }
        if (column.textRight) {
            props.style ||= {};
            props.style.justifyContent = "end";
        }
        return props;
    }
    columnWidths() {
        const columnWidths = {};
        for (const column of this.s.preparedColumns) {
            columnWidths[column.tableSettingColumn.identifier()] = column.width;
        }
        return columnWidths;
    }
    headersContentFromColumns = () => {
        return (<DraggableSort data={this.s.columnsToShow} events={this.tt.draggableSortEvents} horizontal keyExtractor={this.tt.dragListkeyExtractor} onItemMoved={this.tt.onItemMoved} onReordered={this.tt.onReordered} renderItem={this.tt.dragListRenderItemContent}/>);
    };
    dragListCacheKeyExtractor = (item) => `${item.tableSettingColumn.identifier()}-${this.s.resizing}`;
    dragListkeyExtractor = (item) => item.tableSettingColumn.identifier();
    onItemMoved = ({ animationArgs, itemIndex, x, y }) => {
        const animatedPosition = digg(this, "s", "columnsToShow", itemIndex, "animatedPosition");
        if (animationArgs) {
            Animated.timing(animatedPosition, animationArgs).start();
        }
        else {
            animatedPosition.setValue({ x, y });
        }
    };
    onReordered = async ({ fromItem, fromPosition, toItem, toPosition }) => {
        if (fromPosition == toPosition)
            return; // Only do requests and queries if changed
        const TableSettingColumn = fromItem.tableSettingColumn.constructor;
        const toColumn = await TableSettingColumn.find(toItem.tableSettingColumn.id()); // Need to load latest position because ActsAsList might have changed it
        await fromItem.tableSettingColumn.update({ position: toColumn.position() });
    };
    dragListRenderItemContent = ({ isActive, item, touchProps }) => {
        const { animatedWidth, animatedZIndex, column, tableSettingColumn } = item;
        return (<HeaderColumn active={isActive} animatedWidth={animatedWidth} animatedZIndex={animatedZIndex} column={column} key={tableSettingColumn.identifier()} resizing={this.s.resizing} table={this} tableSettingColumn={tableSettingColumn} touchProps={touchProps} widths={this.s.widths}/>);
    };
    headerClassNameForColumn(column) {
        const classNames = [];
        if (column.commonProps && column.commonProps.className)
            classNames.push(column.commonProps.className);
        if (column.headerProps && column.headerProps.className)
            classNames.push(column.headerProps.className);
        return classNames;
    }
    headerLabelForColumn(column) {
        const { modelClass } = this.p;
        if ("label" in column) {
            if (typeof column.label == "function") {
                return column.label();
            }
            else {
                return column.label;
            }
        }
        let currentModelClass = modelClass;
        // Calculate current model class through path
        if (column.path) {
            for (const pathPart of column.path) {
                const relationships = digg(currentModelClass.modelClassData(), "relationships");
                const relationship = relationships.find((relationshipInArray) => relationshipInArray.name == inflection.underscore(pathPart));
                currentModelClass = modelClassRequire(digg(relationship, "resource_name"));
            }
        }
        if (column.attribute)
            return currentModelClass.humanAttributeName(column.attribute);
        throw new Error("No 'label' or 'attribute' was given");
    }
    onFilterFormSubmit = () => this.submitFilter();
    onRequestCloseSettings = () => this.setState({ showSettings: false });
    onSettingsClicked = (e) => {
        e.preventDefault();
        this.setState({ showSettings: !this.s.showSettings });
    };
    submitFilter = () => {
        const { appHistory } = this.props;
        const { queryQName } = this.s;
        const changeParamsParams = {};
        const qParams = this.s.filterForm.asObject();
        if (Platform.OS == "web") {
            const filterForm = digg(this.tt.filterFormRef, "current");
            const navtiveFormParams = Params.serializeForm(filterForm);
            incorporate(qParams, navtiveFormParams);
        }
        changeParamsParams[queryQName] = JSON.stringify(qParams);
        Params.changeParams(changeParamsParams, { appHistory });
    };
    submitFilterDebounce = debounce(this.tt.submitFilter);
}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFibGUuanMiLCJzb3VyY2VSb290IjoiL3NyYy8iLCJzb3VyY2VzIjpbInRhYmxlL3RhYmxlLmpzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUMsSUFBSSxFQUFFLElBQUksRUFBQyxNQUFNLFdBQVcsQ0FBQTtBQUNwQyxPQUFPLEtBQUssRUFBRSxFQUFDLGFBQWEsRUFBRSxVQUFVLEVBQUUsT0FBTyxFQUFFLE1BQU0sRUFBQyxNQUFNLE9BQU8sQ0FBQTtBQUN2RSxPQUFPLEVBQUMsUUFBUSxFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFDLE1BQU0sY0FBYyxDQUFBO0FBQ2hFLE9BQU8sYUFBYSxNQUFNLHNCQUFzQixDQUFBO0FBQ2hELE9BQU8sSUFBSSxNQUFNLHNCQUFzQixDQUFBO0FBQ3ZDLE9BQU8sVUFBVSxNQUFNLFlBQVksQ0FBQTtBQUNuQyxPQUFPLFVBQVUsTUFBTSxrQkFBa0IsQ0FBQTtBQUN6QyxPQUFPLGFBQWEsTUFBTSxxQkFBcUIsQ0FBQTtBQUMvQyxPQUFPLFFBQVEsTUFBTSxVQUFVLENBQUE7QUFDL0IsT0FBTyxhQUFhLE1BQU0sNEJBQTRCLENBQUE7QUFDdEQsT0FBTyxFQUFDLFlBQVksRUFBQyxNQUFNLGVBQWUsQ0FBQTtBQUMxQyxPQUFPLE9BQU8sTUFBTSxvQkFBb0IsQ0FBQTtBQUN4QyxPQUFPLFFBQVEsTUFBTSwyQkFBMkIsQ0FBQTtBQUNoRCxPQUFPLEVBQUMsSUFBSSxFQUFDLE1BQU0sWUFBWSxDQUFBO0FBQy9CLE9BQU8sTUFBTSxNQUFNLHdCQUF3QixDQUFBO0FBQzNDLE9BQU8sWUFBWSxNQUFNLG9CQUFvQixDQUFBO0FBQzdDLE9BQU8sWUFBWSxNQUFNLG9CQUFvQixDQUFBO0FBQzdDLE9BQU8sSUFBSSxNQUFNLGtCQUFrQixDQUFBO0FBQ25DLE9BQU8sRUFBQyxXQUFXLEVBQUMsTUFBTSxjQUFjLENBQUE7QUFDeEMsT0FBTyxLQUFLLFVBQVUsTUFBTSxZQUFZLENBQUE7QUFDeEMsT0FB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LGtCQUFrQixDQUFDLFVBQVUsQ0FBQyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLENBQUE7UUFFeEQsTUFBTSxDQUFDLFlBQVksQ0FBQyxrQkFBa0IsRUFBRSxFQUFDLFVBQVUsRUFBQyxDQUFDLENBQUE7SUFDdkQsQ0FBQyxDQUFBO0lBRUQsb0JBQW9CLEdBQUcsUUFBUSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsWUFBWSxDQUFDLENBQUE7Q0FDdEQsQ0FBQyxDQUFDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge2RpZ2csIGRpZ3N9IGZyb20gXCJkaWdnZXJpemVcIlxuaW1wb3J0IFJlYWN0LCB7Y3JlYXRlQ29udGV4dCwgdXNlQ29udGV4dCwgdXNlTWVtbywgdXNlUmVmfSBmcm9tIFwicmVhY3RcIlxuaW1wb3J0IHtBbmltYXRlZCwgUGxhdGZvcm0sIFByZXNzYWJsZSwgVmlld30gZnJvbSBcInJlYWN0LW5hdGl2ZVwiXG5pbXBvcnQgQmFzZUNvbXBvbmVudCBmcm9tIFwiLi4vYmFzZS1jb21wb25lbnQuanNcIlxuaW1wb3J0IENhcmQgZnJvbSBcIi4uL2Jvb3RzdHJhcC9jYXJkLmpzXCJcbmltcG9ydCBjbGFzc05hbWVzIGZyb20gXCJjbGFzc25hbWVzXCJcbmltcG9ydCBDb2xsZWN0aW9uIGZyb20gXCIuLi9jb2xsZWN0aW9uLmpzXCJcbmltcG9ydCBjb2x1bW5WaXNpYmxlIGZyb20gXCIuL2NvbHVtbi12aXNpYmxlLmpzXCJcbmltcG9ydCBkZWJvdW5jZSBmcm9tIFwiZGVib3VuY2VcIlxuaW1wb3J0IERyYWdnYWJsZVNvcnQgZnJvbSBcIi4uL2RyYWdnYWJsZS1zb3J0L2luZGV4LmpzXCJcbmltcG9ydCB7RXZlbnRFbWl0dGVyfSBmcm9tIFwiZXZlbnRlbWl0dGVyM1wiXG5pbXBvcnQgRmlsdGVycyBmcm9tIFwiLi9maWx0ZXJzL2luZGV4LmpzXCJcbmltcG9ydCBGbGF0TGlzdCBmcm9tIFwiLi9jb21wb25lbnRzL2ZsYXQtbGlzdC5qc1wiXG5pbXBvcnQge0Zvcm19IGZyb20gXCIuLi9mb3JtLmpzXCJcbmltcG9ydCBIZWFkZXIgZnJvbSBcIi4vY29tcG9uZW50cy9oZWFkZXIuanNcIlxuaW1wb3J0IEhlYWRlckNvbHVtbiBmcm9tIFwiLi9oZWFkZXItY29sdW1uLmpzXCJcbmltcG9ydCBIZWFkZXJTZWxlY3QgZnJvbSBcIi4vaGVhZGVyLXNlbGVjdC5qc1wiXG5pbXBvcnQgSWNvbiBmcm9tIFwiLi4vdXRpbHMvaWNvbi5qc1wiXG5pbXBvcnQge2luY29ycG9yYXRlfSBmcm9tIFwiaW5jb3Jwb3JhdG9yXCJcbmltcG9ydCAqIGFzIGluZmxlY3Rpb24gZnJvbSBcImluZmxlY3Rpb25cIlxuaW1wb3J0IG1lbW8gZnJvbSBcInNldC1zdGF0ZS1jb21wYXJlL2J1aWxkL21lbW8uanNcIlxuaW1wb3J0IG1vZGVsQ2xhc3NSZXF1aXJlIGZyb20gXCIuLi9tb2RlbC1jbGFzcy1yZXF1aXJlLmpzXCJcbmltcG9ydCBNb2RlbFJvdyBmcm9tIFwiLi9tb2RlbC1yb3cuanNcIlxuaW1wb3J0IFBhZ2luYXRlIGZyb20gXCIuLi9ib290c3RyYXAvcGFnaW5hdGUuanNcIlxuaW1wb3J0IFBhcmFtcyBmcm9tIFwiLi4vcGFyYW1zLmpzXCJcbmltcG9ydCBQcm9wVHlwZXMgZnJvbSBcInByb3AtdHlwZXNcIlxuaW1wb3J0IFJvdyBmcm9tIFwiLi9jb21wb25lbnRzL3Jvdy5qc1wiXG5pbXBvcnQgc2VsZWN0Q2FsY3VsYXRvciBmcm9tIFwiLi9zZWxlY3QtY2FsY3VsYXRvci5qc1wiXG5pbXBvcnQgU2VsZWN0IGZyb20gXCIuLi9pbnB1dHMvc2VsZWN0LmpzXCJcbmltcG9ydCBTZXR0aW5ncyBmcm9tIFwiLi9zZXR0aW5ncy9pbmRleC5qc1wiXG5pbXBvcnQge3NoYXBlQ29tcG9uZW50fSBmcm9tIFwic2V0LXN0YXRlLWNvbXBhcmUvYnVpbGQvc2hhcGUtY29tcG9uZW50LmpzXCJcbmltcG9ydCBUYWJsZVNldHRpbmdzIGZyb20gXCIuL3RhYmxlLXNldHRpbmdzLmpzXCJcbmltcG9ydCBUZXh0IGZyb20gXCIuLi91dGlscy90ZXh0LmpzXCJcbmltcG9ydCB1bmlxdW5pemUgZnJvbSBcInVuaXF1bml6ZVwiXG5pbXBvcnQgdXNlQnJlYWtwb2ludCBmcm9tIFwiLi4vdXNlLWJyZWFrcG9pbnQuanNcIlxuaW1wb3J0IHVzZUNvbGxlY3Rpb24gZnJvbSBcIi4uL3VzZS1jb2xsZWN0aW9uLmpzXCJcbmltcG9ydCB1c2VJMThuIGZyb20gXCJpMThuLW9uLXN0ZXJvaWRzL3NyYy91c2UtaTE4bi5tanNcIlxuaW1wb3J0IHVzZUV2ZW50RW1pdHRlciBmcm9tIFwiLi4vdXNlLWV2ZW50LWVtaXR0ZXIuanNcIlxuaW1wb3J0IHVzZU1vZGVsRXZlbnQgZnJvbSBcIi4uL3VzZS1tb2RlbC1ldmVudC5qc1wiXG5pbXBvcnQgdXNlUXVlcnlQYXJhbXMgZnJvbSBcIm9uLWxvY2F0aW9uLWNoYW5nZWQvYnVpbGQvdXNlLXF1ZXJ5LXBhcmFtcy5qc1wiXG5pbXBvcnQgV2lkdGhzIGZyb20gXCIuL3dpZHRocy5qc1wiXG5pbXBvcnQgV29ya2VyUGx1Z2luc0NoZWNrQWxsQ2hlY2tib3ggZnJvbSBcIi4vd29ya2VyLXBsdWdpbnMtY2hlY2stYWxsLWNoZWNrYm94LmpzXCJcblxuY29uc3QgcGFnaW5hdGlvbk9wdGlvbnMgPSBbMzAsIDYwLCA5MCwgW1wiQWxsXCIsIFwiYWxsXCJdXVxuY29uc3QgVGFibGVDb250ZXh0ID0gY3JlYXRlQ29udGV4dCgpXG5cbmNvbnN0IExpc3RIZWFkZXJDb21wb25lbnQgPSBtZW1vKHNoYXBlQ29tcG9uZW50KGNsYXNzIExpc3RIZWFkZXJDb21wb25lbnQgZXh0ZW5kcyBCYXNlQ29tcG9uZW50IHtcbiAgc2V0dXAoKSB7XG4gICAgdGhpcy51c2VTdGF0ZXMoe1xuICAgICAgbGFzdFVwZGF0ZTogbmV3IERhdGUoKVxuICAgIH0pXG4gIH1cblxuICByZW5kZXIoKSB7XG4gICAgY29uc3Qge21kVXB9ID0gdXNlQnJlYWtwb2ludCgpXG4gICAgY29uc3QgdGFibGVDb250ZXh0VmFsdWUgPSB1c2VDb250ZXh0KFRhYmxlQ29udGV4dClcbiAgICBjb25zdCB0YWJsZSA9IHRhYmxlQ29udGV4dFZhbHVlLnRhYmxlXG4gICAgY29uc3Qge2NvbGxlY3Rpb24sIGV2ZW50cywgcXVlcnlXaXRob3V0UGFnaW5hdGlvbiwgdH0gPSB0YWJsZS50dFxuICAgIGNvbnN0IHtxdWVyeX0gPSBkaWdzKGNvbGxlY3Rpb24sIFwicXVlcnlcIilcblxuICAgIHVzZUV2ZW50RW1pdHRlcihldmVudHMsIFwiY29sdW1uVmlzaWJpbGl0eVVwZGF0ZWRcIiwgdGhpcy50dC5vbkNvbHVtblZpc2liaWxpdHlVcGRhdGVkKVxuXG4gICAgcmV0dXJuIChcbiAgICAgIDxSb3cgc3R5bGU9e3RhYmxlLnN0eWxlRm9yUm93SGVhZGVyKCl9IHRlc3RJRD1cImFwaS1tYWtlci90YWJsZS9oZWFkZXItcm93XCI+XG4gICAgICAgIHt0YWJsZS5wLndvcmtwbGFjZSAmJiB0YWJsZS5zLmN1cnJlbnRXb3JrcGxhY2UgJiZcbiAgICAgICAgICA8SGVhZGVyIHN0eWxlPXt0YWJsZS5zdHlsZUZvckhlYWRlcih7c3R5bGU6IHt3aWR0aDogbWRVcCA/IDQxIDogdW5kZWZpbmVkfX0pfT5cbiAgICAgICAgICAgIDxXb3JrZXJQbHVnaW5zQ2hlY2tBbGxDaGVja2JveFxuICAgICAgICAgICAgICBjdXJyZW50V29ya3BsYWNlPXt0YWJsZS5zLmN1cnJlbnRXb3JrcGxhY2V9XG4gICAgICAgICAgICAgIHF1ZXJ5PXtxdWVyeVdpdGhvdXRQYWdpbmF0aW9ufVxuICAgICAgICAgICAgICBzdHlsZT17dGhpcy5jYWNoZShcIndvcmtlclBsZ3VpbnNDaGVja0FsbENoZWNrYm94U3R5bGVcIiwge21hcmdpbkhvcml6b250YWw6IFwiYXV0b1wifSl9XG4gICAgICAgICAgICAvPlxuICAgICAgICAgICAgeyFtZFVwICYmXG4gICAgICAgICAgICAgIDxUZXh0IHN0eWxlPXt0aGlzLmNhY2hlKFwic2VsZWN0QWxsRm91bmRUZXh0U3R5bGVcIiwge21hcmdpbkxlZnQ6IDN9KX0+XG4gICAgICAgICAgICAgICAge3QoXCIuc2VsZWN0X2FsbF9mb3VuZFwiLCB7ZGVmYXVsdFZhbHVlOiBcIlNlbGVjdCBhbGwgZm91bmRcIn0pfVxuICAgICAgICAgICAgICA8L1RleHQ+XG4gICAgICAgICAgICB9XG4gICAgICAgICAgPC9IZWFkZXI+XG4gICAgICAgIH1cbiAgICAgICAgeyFtZFVwICYmXG4gICAgICAgICAgPEhlYWRlciBzdHlsZT17dGFibGUuc3R5bGVGb3JIZWFkZXIoe3N0eWxlOiB7fX0pfT5cbiAgICAgICAgICAgIDxIZWFkZXJTZWxlY3QgcHJlcGFyZWRDb2x1bW5zPXt0YWJsZS5zLnByZXBhcmVkQ29sdW1uc30gcXVlcnk9e3F1ZXJ5fSB0YWJsZT17dGFibGV9IC8+XG4gICAgICAgICAgPC9IZWFkZXI+XG4gICAgICAgIH1cbiAgICAgICAge21kVXAgJiZcbiAgICAgICAgICA8PlxuICAgICAgICAgICAge3RhYmxlLmhlYWRlcnNDb250ZW50RnJvbUNvbHVtbnMoKX1cbiAgICAgICAgICAgIDxIZWFkZXIgc3R5bGU9e3RhYmxlLnN0eWxlRm9ySGVhZGVyKHtzdHlsZToge30sIHR5cGU6IFwiYWN0aW9uc1wifSl9IC8+XG4gICAgICAgICAgPC8+XG4gICAgICAgIH1cbiAgICAgIDwvUm93PlxuICAgIClcbiAgfVxuXG4gIG9uQ29sdW1uVmlzaWJpbGl0eVVwZGF0ZWQgPSAoKSA9PiB0aGlzLnNldFN0YXRlKHtsYXN0VXBkYXRlOiBuZXcgRGF0ZSgpfSlcbn0pKVxuXG5leHBvcnQgZGVmYXVsdCBtZW1vKHNoYXBlQ29tcG9uZW50KGNsYXNzIEFwaU1ha2VyVGFibGUgZXh0ZW5kcyBCYXNlQ29tcG9uZW50IHtcbiAgc3RhdGljIGRlZmF1bHRQcm9wcyA9IHtcbiAgICBjYXJkOiB0cnVlLFxuICAgIGN1cnJlbnRVc2VyOiBudWxsLFxuICAgIGRlc3Ryb3lFbmFibGVkOiB0cnVlLFxuICAgIGZpbHRlckNhcmQ6IHRydWUsXG4gICAgZmlsdGVyU3VibWl0QnV0dG9uOiB0cnVlLFxuICAgIG5vUmVjb3Jkc0F2YWlsYWJsZUNvbnRlbnQ6IHVuZGVmaW5lZCxcbiAgICBub1JlY29yZHNGb3VuZENvbnRlbnQ6IHVuZGVmaW5lZCxcbiAgICBwcmVsb2FkczogW10sXG4gICAgc2VsZWN0OiB7fSxcbiAgICBzdHlsZVVJOiB0cnVlLFxuICAgIHdvcmtwbGFjZTogZmFsc2VcbiAgfVxuXG4gIHN0YXRpYyBwcm9wVHlwZXMgPSB7XG4gICAgYWJpbGl0aWVzOiBQcm9wVHlwZXMub2JqZWN0LFxuICAgIGFjdGlvbnNDb250ZW50OiBQcm9wVHlwZXMuZnVuYyxcbiAgICBhcHBIaXN0b3J5OiBQcm9wVHlwZXMub2JqZWN0LFxuICAgIGNhcmQ6IFByb3BUeXBlcy5ib29sLmlzUmVxdWlyZWQsXG4gICAgY2xhc3NOYW1lOiBQcm9wVHlwZXMuc3RyaW5nLFxuICAgIGNvbGxlY3Rpb246IFByb3BUeXBlcy5pbnN0YW5jZU9mKENvbGxlY3Rpb24pLFxuICAgIGNvbHVtbnM6IFByb3BUeXBlcy5vbmVPZlR5cGUoW1Byb3BUeXBlcy5hcnJheSwgUHJvcFR5cGVzLmZ1bmNdKSxcbiAgICBjb250cm9sczogUHJvcFR5cGVzLmZ1bmMsXG4gICAgY3VycmVudFVzZXI6IFByb3BUeXBlcy5vYmplY3QsXG4gICAgZGVmYXVsdERhdGVGb3JtYXROYW1lOiBQcm9wVHlwZXMuc3RyaW5nLFxuICAgIGRlZmF1bHREYXRlVGltZUZvcm1hdE5hbWU6IFByb3BUeXBlcy5zdHJpbmcsXG4gICAgZGVmYXVsdFBhcmFtczogUHJvcFR5cGVzLm9iamVjdCxcbiAgICBkZXN0cm95RW5hYmxlZDogUHJvcFR5cGVzLmJvb2wuaXNSZXF1aXJlZCxcbiAgICBkZXN0cm95TWVzc2FnZTogUHJvcFR5cGVzLnN0cmluZyxcbiAgICBlZGl0TW9kZWxQYXRoOiBQcm9wVHlwZXMuZnVuYyxcbiAgICBmaWx0ZXJDYXJkOiBQcm9wVHlwZXMuYm9vbC5pc1JlcXVpcmVkLFxuICAgIGZpbHRlckNvbnRlbnQ6IFByb3BUeXBlcy5mdW5jLFxuICAgIGZpbHRlclN1Ym1pdExhYmVsOiBQcm9wVHlwZXMuYW55LFxuICAgIGdyb3VwQnk6IFByb3BUeXBlcy5hcnJheSxcbiAgICBoZWFkZXI6IFByb3BUeXBlcy5vbmVPZlR5cGUoW1Byb3BUeXBlcy5mdW5jLCBQcm9wVHlwZXMuc3RyaW5nXSksXG4gICAgaWRlbnRpZmllcjogUHJvcFR5cGVzLnN0cmluZyxcbiAgICBtb2RlbENsYXNzOiBQcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuICAgIG5vUmVjb3Jkc0F2YWlsYWJsZUNvbnRlbnQ6IFByb3BUeXBlcy5mdW5jLFxuICAgIG5vUmVjb3Jkc0ZvdW5kQ29udGVudDogUHJvcFR5cGVzLmZ1bmMsXG4gICAgb25Nb2RlbHNMb2FkZWQ6IFByb3BUeXBlcy5mdW5jLFxuICAgIHBhZ2luYXRlQ29udGVudDogUHJvcFR5cGVzLmZ1bmMsXG4gICAgcGFnaW5hdGlvbkNvbXBvbmVudDogUHJvcFR5cGVzLmZ1bmMsXG4gICAgcHJlbG9hZHM6IFByb3BUeXBlcy5hcnJheS5pc1JlcXVpcmVkLFxuICAgIHF1ZXJ5TWV0aG9kOiBQcm9wVHlwZXMuZnVuYyxcbiAgICBxdWVyeU5hbWU6IFByb3BUeXBlcy5zdHJpbmcsXG4gICAgc2VsZWN0OiBQcm9wVHlwZXMub2JqZWN0LFxuICAgIHNlbGVjdENvbHVtbnM6IFByb3BUeXBlcy5vYmplY3QsXG4gICAgc3R5bGVzOiBQcm9wVHlwZXMub2JqZWN0LFxuICAgIHN0eWxlVUk6IFByb3BUeXBlcy5ib29sLmlzUmVxdWlyZWQsXG4gICAgdmlld01vZGVsUGF0aDogUHJvcFR5cGVzLmZ1bmMsXG4gICAgd29ya3BsYWNlOiBQcm9wVHlwZXMuYm9vbC5pc1JlcXVpcmVkXG4gIH1cblxuICBkcmFnZ2FibGVTb3J0RXZlbnRzID0gbmV3IEV2ZW50RW1pdHRlcigpXG4gIGV2ZW50cyA9IG5ldyBFdmVudEVtaXR0ZXIoKVxuICB0YWJsZVNldHRpbmdzID0gbnVsbFxuXG4gIHNldHVwKCkge1xuICAgIGNvbnN0IHt0fSA9IHVzZUkxOG4oe25hbWVzcGFjZTogXCJqcy5hcGlfbWFrZXIudGFibGVcIn0pXG4gICAgY29uc3Qge25hbWU6IGJyZWFrcG9pbnQsIG1kVXB9ID0gdXNlQnJlYWtwb2ludCgpXG4gICAgY29uc3QgcXVlcnlQYXJhbXMgPSB1c2VRdWVyeVBhcmFtcygpXG5cbiAgICB0aGlzLnNldEluc3RhbmNlKHtcbiAgICAgIGJyZWFrcG9pbnQsXG4gICAgICBmaWx0ZXJGb3JtUmVmOiB1c2VSZWYoKSxcbiAgICAgIG1kVXAsXG4gICAgICB0XG4gICAgfSlcblxuICAgIGNvbnN0IGNvbGxlY3Rpb25LZXkgPSBkaWdnKHRoaXMucC5tb2RlbENsYXNzLm1vZGVsQ2xhc3NEYXRhKCksIFwiY29sbGVjdGlvbktleVwiKVxuICAgIGxldCBxdWVyeU5hbWUgPSB0aGlzLnByb3BzLnF1ZXJ5TmFtZVxuXG4gICAgaWYgKCFxdWVyeU5hbWUpIHF1ZXJ5TmFtZSA9IGNvbGxlY3Rpb25LZXlcblxuICAgIGNvbnN0IHF1ZXJ5U05hbWUgPSBgJHtxdWVyeU5hbWV9X3NgXG5cbiAgICB0aGlzLnVzZVN0YXRlcyh7XG4gICAgICBjb2x1bW5zOiAoKSA9PiB0aGlzLmNvbHVtbnNBc0FycmF5KCksXG4gICAgICBjdXJyZW50V29ya3BsYWNlOiB1bmRlZmluZWQsXG4gICAgICBjdXJyZW50V29ya3BsYWNlQ291bnQ6IG51bGwsXG4gICAgICBmaWx0ZXJGb3JtOiBudWxsLFxuICAgICAgY29sdW1uc1RvU2hvdzogbnVsbCxcbiAgICAgIGRyYWdnZWRDb2x1bW46IG51bGwsXG4gICAgICBpZGVudGlmaWVyOiAoKSA9PiB0aGlzLnByb3BzLmlkZW50aWZpZXIgfHwgYCR7Y29sbGVjdGlvbktleX0tZGVmYXVsdGAsXG4gICAgICBsYXN0VXBkYXRlOiAoKSA9PiBuZXcgRGF0ZSgpLFxuICAgICAgcHJlbG9hZDogdW5kZWZpbmVkLFxuICAgICAgcHJlcGFyZWRDb2x1bW5zOiB1bmRlZmluZWQsXG4gICAgICBxdWVyeU5hbWUsXG4gICAgICBxdWVyeVFOYW1lOiAoKSA9PiBgJHtxdWVyeU5hbWV9X3FgLFxuICAgICAgcXVlcnlQYWdlTmFtZTogKCkgPT4gYCR7cXVlcnlOYW1lfV9wYWdlYCxcbiAgICAgIHF1ZXJ5U05hbWUsXG4gICAgICByZXNpemluZzogZmFsc2UsXG4gICAgICBzaG93RmlsdGVyczogKCkgPT4gQm9vbGVhbihxdWVyeVBhcmFtc1txdWVyeVNOYW1lXSksXG4gICAgICBzaG93U2V0dGluZ3M6IGZhbHNlLFxuICAgICAgdGFibGVTZXR0aW5nOiB1bmRlZmluZWQsXG4gICAgICB0YWJsZVNldHRpbmdMb2FkZWQ6IGZhbHNlLFxuICAgICAgdGFibGVTZXR0aW5nRnVsbENhY2hlS2V5OiB1bmRlZmluZWQsXG4gICAgICB3aWR0aDogdW5kZWZpbmVkLFxuICAgICAgd2lkdGhzOiBudWxsXG4gICAgfSlcblxuICAgIHRoaXMudGFibGVDb250ZXh0VmFsdWUgPSB1c2VNZW1vKFxuICAgICAgKCkgPT4gKHtcbiAgICAgICAgY2FjaGVLZXk6IHRoaXMucy50YWJsZVNldHRpbmdGdWxsQ2FjaGVLZXksXG4gICAgICAgIGxhc3RVcGRhdGU6IHRoaXMucy5sYXN0VXBkYXRlLFxuICAgICAgICByZXNpemluZzogdGhpcy5zLnJlc2l6aW5nLFxuICAgICAgICB0YWJsZTogdGhpc1xuICAgICAgfSksXG4gICAgICBbdGhpcy5zLmxhc3RVcGRhdGUsIHRoaXMucy5yZXNpemluZywgdGhpcy5zLnRhYmxlU2V0dGluZ0Z1bGxDYWNoZUtleV1cbiAgICApXG5cbiAgICB1c2VNZW1vKCgpID0+IHtcbiAgICAgIGlmICh0aGlzLnByb3BzLndvcmtwbGFjZSkge1xuICAgICAgICB0aGlzLmxvYWRDdXJyZW50V29ya3BsYWNlKCkudGhlbigoKSA9PiB7XG4gICAgICAgICAgdGhpcy5sb2FkQ3VycmVudFdvcmtwbGFjZUNvdW50KClcbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICB9LCBbdGhpcy5wLmN1cnJlbnRVc2VyPy5pZCgpXSlcblxuICAgIHVzZU1lbW8oKCkgPT4ge1xuICAgICAgaWYgKCF0aGlzLnR0LnRhYmxlU2V0dGluZ3MgJiYgdGhpcy5zLndpZHRoKSB7XG4gICAgICAgIHRoaXMubG9hZFRhYmxlU2V0dGluZygpXG4gICAgICB9XG4gICAgfSwgW3RoaXMucC5jdXJyZW50VXNlcj8uaWQoKSwgdGhpcy5zLndpZHRoXSlcblxuICAgIHVzZU1vZGVsRXZlbnQodGhpcy5zLmN1cnJlbnRXb3JrcGxhY2UsIFwid29ya3BsYWNlX2xpbmtzX2NyZWF0ZWRcIiwgdGhpcy50dC5vbkxpbmtzQ3JlYXRlZClcbiAgICB1c2VNb2RlbEV2ZW50KHRoaXMucy5jdXJyZW50V29ya3BsYWNlLCBcIndvcmtwbGFjZV9saW5rc19kZXN0cm95ZWRcIiwgdGhpcy50dC5vbkxpbmtzRGVzdHJveWVkKVxuXG4gICAgbGV0IGNvbGxlY3Rpb25SZWFkeSA9IHRydWVcbiAgICBsZXQgc2VsZWN0XG5cbiAgICBpZiAoIXRoaXMucy5wcmVwYXJlZENvbHVtbnMpIHtcbiAgICAgIGNvbGxlY3Rpb25SZWFkeSA9IGZhbHNlXG4gICAgfVxuXG4gICAgaWYgKGNvbGxlY3Rpb25SZWFkeSkge1xuICAgICAgc2VsZWN0ID0gc2VsZWN0Q2FsY3VsYXRvcih7dGFibGU6IHRoaXN9KVxuICAgIH1cblxuICAgIHRoaXMuY29sbGVjdGlvbiA9IHVzZUNvbGxlY3Rpb24oe1xuICAgICAgYWJpbGl0aWVzOiB0aGlzLmFiaWxpdGllc1RvTG9hZCgpLFxuICAgICAgZGVmYXVsdFBhcmFtczogdGhpcy5wcm9wcy5kZWZhdWx0UGFyYW1zLFxuICAgICAgY29sbGVjdGlvbjogdGhpcy5wcm9wcy5jb2xsZWN0aW9uLFxuICAgICAgZ3JvdXBCeTogdGhpcy5wcm9wcy5ncm91cEJ5LFxuICAgICAgaWZDb25kaXRpb246IGNvbGxlY3Rpb25SZWFkeSxcbiAgICAgIG1vZGVsQ2xhc3M6IHRoaXMucHJvcHMubW9kZWxDbGFzcyxcbiAgICAgIG9uTW9kZWxzTG9hZGVkOiB0aGlzLnByb3BzLm9uTW9kZWxzTG9hZGVkLFxuICAgICAgbm9SZWNvcmRzQXZhaWxhYmxlQ29udGVudDogdGhpcy5wcm9wcy5ub1JlY29yZHNBdmFpbGFibGVDb250ZW50LFxuICAgICAgbm9SZWNvcmRzRm91bmRDb250ZW50OiB0aGlzLnByb3BzLm5vUmVjb3Jkc0ZvdW5kQ29udGVudCxcbiAgICAgIHBhZ2luYXRpb246IHRydWUsXG4gICAgICBwcmVsb2FkczogdGhpcy5zdGF0ZS5wcmVsb2FkLFxuICAgICAgcXVlcnlNZXRob2Q6IHRoaXMucHJvcHMucXVlcnlNZXRob2QsXG4gICAgICBxdWVyeU5hbWUsXG4gICAgICBzZWxlY3QsXG4gICAgICBzZWxlY3RDb2x1bW5zOiB0aGlzLnByb3BzLnNlbGVjdENvbHVtbnNcbiAgICB9KVxuICAgIHRoaXMucXVlcnlXaXRob3V0UGFnaW5hdGlvbiA9IHVzZU1lbW8oXG4gICAgICAoKSA9PiB0aGlzLmNvbGxlY3Rpb24/LnF1ZXJ5Py5jbG9uZSgpPy5leGNlcHQoXCJwYWdlXCIpLFxuICAgICAgW3RoaXMuY29sbGVjdGlvbi5xdWVyeV1cbiAgICApXG5cbiAgICB1c2VFdmVudEVtaXR0ZXIodGhpcy50dC5kcmFnZ2FibGVTb3J0RXZlbnRzLCBcIm9uRHJhZ1N0YXJ0XCIsIHRoaXMudHQub25EcmFnU3RhcnQpXG4gICAgdXNlRXZlbnRFbWl0dGVyKHRoaXMudHQuZHJhZ2dhYmxlU29ydEV2ZW50cywgXCJvbkRyYWdFbmRBbmltYXRpb25cIiwgdGhpcy50dC5vbkRyYWdFbmRBbmltYXRpb24pXG4gICAgdXNlRXZlbnRFbWl0dGVyKHRoaXMudHQuZXZlbnRzLCBcImNvbHVtblZpc2liaWxpdHlVcGRhdGVkXCIsIHRoaXMudHQub25Db2x1bW5WaXNpYmlsaXR5VXBkYXRlZClcbiAgfVxuXG4gIG9uQ29sdW1uVmlzaWJpbGl0eVVwZGF0ZWQgPSAoKSA9PiB0aGlzLnNldFN0YXRlKHtjb2x1bW5zVG9TaG93OiB0aGlzLmdldENvbHVtbnNUb1Nob3codGhpcy5zLmNvbHVtbnMpLCBsYXN0VXBkYXRlOiBuZXcgRGF0ZSgpfSlcbiAgb25EcmFnU3RhcnQgPSAoe2l0ZW19KSA9PiBpdGVtLmFuaW1hdGVkWkluZGV4LnNldFZhbHVlKDk5OTkpXG4gIG9uRHJhZ0VuZEFuaW1hdGlvbiA9ICh7aXRlbX0pID0+IGl0ZW0uYW5pbWF0ZWRaSW5kZXguc2V0VmFsdWUoMClcblxuICBhc3luYyBsb2FkQ3VycmVudFdvcmtwbGFjZSgpIHtcbiAgICBjb25zdCBXb3JrcGxhY2UgPSBtb2RlbENsYXNzUmVxdWlyZShcIldvcmtwbGFjZVwiKVxuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IFdvcmtwbGFjZS5jdXJyZW50KClcbiAgICBjb25zdCBjdXJyZW50V29ya3BsYWNlID0gZGlnZyhyZXN1bHQsIFwiY3VycmVudFwiLCAwKVxuXG4gICAgdGhpcy5zZXRTdGF0ZSh7Y3VycmVudFdvcmtwbGFjZX0pXG4gIH1cblxuICBhc3luYyBsb2FkQ3VycmVudFdvcmtwbGFjZUNvdW50KCkge1xuICAgIGNvbnN0IFdvcmtwbGFjZUxpbmsgPSBtb2RlbENsYXNzUmVxdWlyZShcIldvcmtwbGFjZUxpbmtcIilcbiAgICBjb25zdCBjdXJyZW50V29ya3BsYWNlQ291bnQgPSBhd2FpdCBXb3JrcGxhY2VMaW5rXG4gICAgICAucmFuc2Fjayh7XG4gICAgICAgIHJlc291cmNlX3R5cGVfZXE6IHRoaXMucC5tb2RlbENsYXNzLm1vZGVsQ2xhc3NEYXRhKCkubmFtZSxcbiAgICAgICAgd29ya3BsYWNlX2lkX2VxOiB0aGlzLnMuY3VycmVudFdvcmtwbGFjZS5pZCgpXG4gICAgICB9KVxuICAgICAgLmNvdW50KClcblxuICAgIHRoaXMuc2V0U3RhdGUoe2N1cnJlbnRXb3JrcGxhY2VDb3VudH0pXG4gIH1cblxuICBnZXRDb2x1bW5zVG9TaG93KGNvbHVtbnMpIHtcbiAgICByZXR1cm4gY29sdW1uc1xuICAgICAgLmZpbHRlcigoe2NvbHVtbiwgdGFibGVTZXR0aW5nQ29sdW1ufSkgPT4gY29sdW1uVmlzaWJsZShjb2x1bW4sIHRhYmxlU2V0dGluZ0NvbHVtbikpXG4gICAgICAuc29ydCgoYSwgYikgPT4gYS50YWJsZVNldHRpbmdDb2x1bW4ucG9zaXRpb24oKSAtIGIudGFibGVTZXR0aW5nQ29sdW1uLnBvc2l0aW9uKCkpXG4gIH1cblxuICBhc3luYyBsb2FkVGFibGVTZXR0aW5nKCkge1xuICAgIHRoaXMudGFibGVTZXR0aW5ncyA9IG5ldyBUYWJsZVNldHRpbmdzKHt0YWJsZTogdGhpc30pXG5cbiAgICBjb25zdCB0YWJsZVNldHRpbmcgPSBhd2FpdCB0aGlzLnRhYmxlU2V0dGluZ3MubG9hZEV4aXN0aW5nT3JDcmVhdGVUYWJsZVNldHRpbmdzKClcbiAgICBjb25zdCB7Y29sdW1ucywgcHJlbG9hZH0gPSB0aGlzLnRhYmxlU2V0dGluZ3MucHJlcGFyZWRDb2x1bW5zKHRhYmxlU2V0dGluZylcbiAgICBjb25zdCB7d2lkdGh9ID0gdGhpcy5zXG4gICAgY29uc3Qgd2lkdGhzID0gbmV3IFdpZHRocyh7Y29sdW1ucywgdGFibGU6IHRoaXMsIHdpZHRofSlcbiAgICBjb25zdCBjb2x1bW5zVG9TaG93ID0gdGhpcy5nZXRDb2x1bW5zVG9TaG93KGNvbHVtbnMpXG5cbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIGNvbHVtbnMsXG4gICAgICBjb2x1bW5zVG9TaG93LFxuICAgICAgcHJlcGFyZWRDb2x1bW5zOiBjb2x1bW5zLFxuICAgICAgcHJlbG9hZDogdGhpcy5tZXJnZWRQcmVsb2FkcyhwcmVsb2FkKSxcbiAgICAgIHRhYmxlU2V0dGluZyxcbiAgICAgIHRhYmxlU2V0dGluZ0xvYWRlZDogdHJ1ZSxcbiAgICAgIHRhYmxlU2V0dGluZ0Z1bGxDYWNoZUtleTogdGFibGVTZXR0aW5nLmZ1bGxDYWNoZUtleSgpLFxuICAgICAgd2lkdGhzXG4gICAgfSlcbiAgfVxuXG4gIHVwZGF0ZVNldHRpbmdzRnVsbENhY2hlS2V5ID0gKCkgPT4gdGhpcy5zZXRTdGF0ZSh7dGFibGVTZXR0aW5nRnVsbENhY2hlS2V5OiB0aGlzLnN0YXRlLnRhYmxlU2V0dGluZy5mdWxsQ2FjaGVLZXkoKX0pXG5cbiAgY29sdW1uc0FzQXJyYXkgPSAoKSA9PiB7XG4gICAgaWYgKHR5cGVvZiB0aGlzLnByb3BzLmNvbHVtbnMgPT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICByZXR1cm4gdGhpcy5wcm9wcy5jb2x1bW5zKClcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5wcm9wcy5jb2x1bW5zXG4gIH1cblxuICBtZXJnZWRQcmVsb2FkcyhwcmVsb2FkKSB7XG4gICAgY29uc3Qge3ByZWxvYWRzfSA9IHRoaXMucHJvcHNcbiAgICBsZXQgbWVyZ2VkUHJlbG9hZHMgPSBbXVxuXG4gICAgaWYgKHByZWxvYWRzKSBtZXJnZWRQcmVsb2FkcyA9IG1lcmdlZFByZWxvYWRzLmNvbmNhdChwcmVsb2FkcylcbiAgICBpZiAocHJlbG9hZCkgbWVyZ2VkUHJlbG9hZHMgPSBtZXJnZWRQcmVsb2Fkcy5jb25jYXQocHJlbG9hZClcblxuICAgIHJldHVybiB1bmlxdW5pemUobWVyZ2VkUHJlbG9hZHMpXG4gIH1cblxuICByZW5kZXIgKCkge1xuICAgIGNvbnN0IHttb2RlbENsYXNzLCBub1JlY29yZHNBdmFpbGFibGVDb250ZW50LCBub1JlY29yZHNGb3VuZENvbnRlbnR9ID0gdGhpcy5wXG4gICAgY29uc3Qge2NvbGxlY3Rpb24sIGN1cnJlbnRVc2VyfSA9IHRoaXMucHJvcHNcbiAgICBjb25zdCB7cXVlcnlOYW1lLCBxdWVyeVNOYW1lLCBzaG93RmlsdGVyc30gPSB0aGlzLnNcbiAgICBjb25zdCB7XG4gICAgICBtb2RlbHMsXG4gICAgICBvdmVyYWxsQ291bnQsXG4gICAgICBxUGFyYW1zLFxuICAgICAgcXVlcnksXG4gICAgICByZXN1bHQsXG4gICAgICBzaG93Tm9SZWNvcmRzQXZhaWxhYmxlQ29udGVudCxcbiAgICAgIHNob3dOb1JlY29yZHNGb3VuZENvbnRlbnRcbiAgICB9ID0gZGlncyhcbiAgICAgIHRoaXMuY29sbGVjdGlvbixcbiAgICAgIFwibW9kZWxzXCIsXG4gICAgICBcIm92ZXJhbGxDb3VudFwiLFxuICAgICAgXCJxUGFyYW1zXCIsXG4gICAgICBcInF1ZXJ5XCIsXG4gICAgICBcInJlc3VsdFwiLFxuICAgICAgXCJzaG93Tm9SZWNvcmRzQXZhaWxhYmxlQ29udGVudFwiLFxuICAgICAgXCJzaG93Tm9SZWNvcmRzRm91bmRDb250ZW50XCJcbiAgICApXG5cbiAgICBpZiAoY29sbGVjdGlvbiAmJiBjb2xsZWN0aW9uLmFyZ3MubW9kZWxDbGFzcy5tb2RlbENsYXNzRGF0YSgpLm5hbWUgIT0gbW9kZWxDbGFzcy5tb2RlbENsYXNzRGF0YSgpLm5hbWUpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgYE1vZGVsIGNsYXNzIGZyb20gY29sbGVjdGlvbiAnJHtjb2xsZWN0aW9uLmFyZ3MubW9kZWxDbGFzcy5tb2RlbENsYXNzRGF0YSgpLm5hbWV9JyBgICtcbiAgICAgICAgYGRpZG4ndCBtYXRjaCBtb2RlbCBjbGFzcyBvbiB0YWJsZTogJyR7bW9kZWxDbGFzcy5tb2RlbENsYXNzRGF0YSgpLm5hbWV9J2BcbiAgICAgIClcbiAgICB9XG5cbiAgICByZXR1cm4gKFxuICAgICAgPFZpZXdcbiAgICAgICAgZGF0YVNldD17dGhpcy5jYWNoZShcInJvb3RWaWV3RGF0YVNldFwiLCB7Y2xhc3M6IHRoaXMuY2xhc3NOYW1lKCl9LCBbdGhpcy5jbGFzc05hbWUoKV0pfVxuICAgICAgICBvbkxheW91dD17dGhpcy50dC5vbkNvbnRhaW5lckxheW91dH1cbiAgICAgICAgc3R5bGU9e3RoaXMucHJvcHMuc3R5bGVzPy5jb250YWluZXJ9XG4gICAgICA+XG4gICAgICAgIHtzaG93Tm9SZWNvcmRzQXZhaWxhYmxlQ29udGVudCAmJlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibGl2ZS10YWJsZS0tbm8tcmVjb3Jkcy1hdmFpbGFibGUtY29udGVudFwiPlxuICAgICAgICAgICAge25vUmVjb3Jkc0F2YWlsYWJsZUNvbnRlbnQoe21vZGVscywgcVBhcmFtcywgb3ZlcmFsbENvdW50fSl9XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIH1cbiAgICAgICAge3Nob3dOb1JlY29yZHNGb3VuZENvbnRlbnQgJiZcbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImxpdmUtdGFibGUtLW5vLXJlY29yZHMtZm91bmQtY29udGVudFwiPlxuICAgICAgICAgICAge25vUmVjb3Jkc0ZvdW5kQ29udGVudCh7bW9kZWxzLCBxUGFyYW1zLCBvdmVyYWxsQ291bnR9KX1cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgfVxuICAgICAgICB7c2hvd0ZpbHRlcnMgJiZcbiAgICAgICAgICA8RmlsdGVycyBjdXJyZW50VXNlcj17Y3VycmVudFVzZXJ9IG1vZGVsQ2xhc3M9e21vZGVsQ2xhc3N9IHF1ZXJ5TmFtZT17cXVlcnlOYW1lfSBxdWVyeVNOYW1lPXtxdWVyeVNOYW1lfSAvPlxuICAgICAgICB9XG4gICAgICAgIHsoKCkgPT4ge1xuICAgICAgICAgIGlmIChxUGFyYW1zICYmIHF1ZXJ5ICYmIHJlc3VsdCAmJiBtb2RlbHMgJiYgIXNob3dOb1JlY29yZHNBdmFpbGFibGVDb250ZW50ICYmICFzaG93Tm9SZWNvcmRzRm91bmRDb250ZW50KSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jYXJkT3JUYWJsZSgpXG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgIDxWaWV3PlxuICAgICAgICAgICAgICAgIDxUZXh0Pnt0aGlzLnQoXCIubG9hZGluZ19kb3RfZG90X2RpdFwiLCB7ZGVmYXVsdFZhbHVlOiBcIkxvYWRpbmcuLi5cIn0pfTwvVGV4dD5cbiAgICAgICAgICAgICAgPC9WaWV3PlxuICAgICAgICAgICAgKVxuICAgICAgICAgIH1cbiAgICAgICAgfSkoKX1cbiAgICAgIDwvVmlldz5cbiAgICApXG4gIH1cblxuICBhYmlsaXRpZXNUb0xvYWQgKCkge1xuICAgIGNvbnN0IGFiaWxpdGllc1RvTG9hZCA9IHt9XG4gICAgY29uc3Qge2FiaWxpdGllcywgbW9kZWxDbGFzc30gPSB0aGlzLnByb3BzXG4gICAgY29uc3Qgb3duQWJpbGl0aWVzID0gW11cblxuICAgIGlmICh0aGlzLnByb3BzLmRlc3Ryb3lFbmFibGVkKSBvd25BYmlsaXRpZXMucHVzaChcImRlc3Ryb3lcIilcbiAgICBpZiAodGhpcy5wcm9wcy5lZGl0TW9kZWxQYXRoKSBvd25BYmlsaXRpZXMucHVzaChcImVkaXRcIilcbiAgICBpZiAodGhpcy5wcm9wcy52aWV3TW9kZWxQYXRoKSBvd25BYmlsaXRpZXMucHVzaChcInNob3dcIilcblxuICAgIGlmIChvd25BYmlsaXRpZXMubGVuZ3RoID4gMCkge1xuICAgICAgY29uc3QgbW9kZWxDbGFzc05hbWUgPSBkaWdnKG1vZGVsQ2xhc3MubW9kZWxDbGFzc0RhdGEoKSwgXCJuYW1lXCIpXG5cbiAgICAgIGFiaWxpdGllc1RvTG9hZFttb2RlbENsYXNzTmFtZV0gPSBvd25BYmlsaXRpZXNcbiAgICB9XG5cbiAgICBpZiAoYWJpbGl0aWVzKSB7XG4gICAgICBmb3IgKGNvbnN0IG1vZGVsTmFtZSBpbiBhYmlsaXRpZXMpIHtcbiAgICAgICAgaWYgKCEobW9kZWxOYW1lIGluIGFiaWxpdGllc1RvTG9hZCkpIHtcbiAgICAgICAgICBhYmlsaXRpZXNUb0xvYWRbbW9kZWxOYW1lXSA9IFtdXG4gICAgICAgIH1cblxuICAgICAgICBmb3IgKGNvbnN0IGFiaWxpdHkgb2YgYWJpbGl0aWVzW21vZGVsTmFtZV0pIHtcbiAgICAgICAgICBhYmlsaXRpZXNUb0xvYWRbbW9kZWxOYW1lXS5wdXNoKGFiaWxpdHkpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gYWJpbGl0aWVzVG9Mb2FkXG4gIH1cblxuICBjYXJkT3JUYWJsZSAoKSB7XG4gICAgY29uc3Qge1xuICAgICAgYWJpbGl0aWVzLFxuICAgICAgYWN0aW9uc0NvbnRlbnQsXG4gICAgICBhcHBIaXN0b3J5LFxuICAgICAgY2FyZCxcbiAgICAgIGNsYXNzTmFtZSxcbiAgICAgIGNvbGxlY3Rpb24sXG4gICAgICBjb2x1bW5zLFxuICAgICAgY29udHJvbHMsXG4gICAgICBjdXJyZW50VXNlcixcbiAgICAgIGRlZmF1bHREYXRlRm9ybWF0TmFtZSxcbiAgICAgIGRlZmF1bHREYXRlVGltZUZvcm1hdE5hbWUsXG4gICAgICBkZWZhdWx0UGFyYW1zLFxuICAgICAgZGVzdHJveUVuYWJsZWQsXG4gICAgICBkZXN0cm95TWVzc2FnZSxcbiAgICAgIGVkaXRNb2RlbFBhdGgsXG4gICAgICBmaWx0ZXJDYXJkLFxuICAgICAgZmlsdGVyQ29udGVudCxcbiAgICAgIGZpbHRlclN1Ym1pdEJ1dHRvbixcbiAgICAgIGZpbHRlclN1Ym1pdExhYmVsLFxuICAgICAgZ3JvdXBCeSxcbiAgICAgIGhlYWRlcixcbiAgICAgIGlkZW50aWZpZXIsXG4gICAgICBtb2RlbENsYXNzLFxuICAgICAgbm9SZWNvcmRzQXZhaWxhYmxlQ29udGVudCxcbiAgICAgIG5vUmVjb3Jkc0ZvdW5kQ29udGVudCxcbiAgICAgIG9uTW9kZWxzTG9hZGVkLFxuICAgICAgcGFnaW5hdGVDb250ZW50LFxuICAgICAgcGFnaW5hdGlvbkNvbXBvbmVudCxcbiAgICAgIHByZWxvYWRzLFxuICAgICAgcXVlcnlNZXRob2QsXG4gICAgICBxdWVyeU5hbWUsXG4gICAgICBzZWxlY3QsXG4gICAgICBzZWxlY3RDb2x1bW5zLFxuICAgICAgc3R5bGVVSSxcbiAgICAgIHZpZXdNb2RlbFBhdGgsXG4gICAgICB3b3JrcGxhY2UsXG4gICAgICAuLi5yZXN0UHJvcHNcbiAgICB9ID0gdGhpcy5wcm9wc1xuICAgIGNvbnN0IHttb2RlbHMsIHFQYXJhbXMsIHF1ZXJ5LCByZXN1bHR9ID0gZGlncyh0aGlzLmNvbGxlY3Rpb24sIFwibW9kZWxzXCIsIFwicVBhcmFtc1wiLCBcInF1ZXJ5XCIsIFwicmVzdWx0XCIpXG5cbiAgICBsZXQgaGVhZGVyQ29udGVudCwgUGFnaW5hdGlvbkNvbXBvbmVudFxuXG4gICAgaWYgKHR5cGVvZiBoZWFkZXIgPT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICBoZWFkZXJDb250ZW50ID0gaGVhZGVyKHttb2RlbHMsIHFQYXJhbXMsIHF1ZXJ5LCByZXN1bHR9KVxuICAgIH0gZWxzZSBpZiAoaGVhZGVyKSB7XG4gICAgICBoZWFkZXJDb250ZW50ID0gaGVhZGVyXG4gICAgfSBlbHNlIHtcbiAgICAgIGhlYWRlckNvbnRlbnQgPSBtb2RlbENsYXNzLm1vZGVsTmFtZSgpLmh1bWFuKHtjb3VudDogMn0pXG4gICAgfVxuXG4gICAgaWYgKCFwYWdpbmF0ZUNvbnRlbnQpIHtcbiAgICAgIGlmIChwYWdpbmF0aW9uQ29tcG9uZW50KSB7XG4gICAgICAgIFBhZ2luYXRpb25Db21wb25lbnQgPSBwYWdpbmF0aW9uQ29tcG9uZW50XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBQYWdpbmF0aW9uQ29tcG9uZW50ID0gUGFnaW5hdGVcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCBmbGF0TGlzdFN0eWxlID0ge1xuICAgICAgb3ZlcmZsb3dYOiBcImF1dG9cIlxuICAgIH1cblxuICAgIGlmIChzdHlsZVVJKSB7XG4gICAgICBmbGF0TGlzdFN0eWxlLmJvcmRlciA9IFwiMXB4IHNvbGlkICNkYmRiZGJcIlxuICAgICAgZmxhdExpc3RTdHlsZS5ib3JkZXJSYWRpdXMgPSA1XG4gICAgfVxuXG4gICAgY29uc3QgZmxhdExpc3QgPSAoXG4gICAgICA8VGFibGVDb250ZXh0LlByb3ZpZGVyIHZhbHVlPXt0aGlzLnR0LnRhYmxlQ29udGV4dFZhbHVlfT5cbiAgICAgICAgPEZsYXRMaXN0XG4gICAgICAgICAgZGF0YT17bW9kZWxzfVxuICAgICAgICAgIGRhdGFTZXQ9e3tcbiAgICAgICAgICAgIGNsYXNzOiBjbGFzc05hbWVzKFwiYXBpLW1ha2VyLS10YWJsZVwiLCBjbGFzc05hbWUpLFxuICAgICAgICAgICAgY2FjaGVLZXk6IHRoaXMucy50YWJsZVNldHRpbmdGdWxsQ2FjaGVLZXksXG4gICAgICAgICAgICBsYXN0VXBkYXRlOiB0aGlzLnMubGFzdFVwZGF0ZVxuICAgICAgICAgIH19XG4gICAgICAgICAgZXh0cmFEYXRhPXt0aGlzLnMubGFzdFVwZGF0ZX1cbiAgICAgICAgICBrZXlFeHRyYWN0b3I9e3RoaXMudHQua2V5RXh0cmF0b3J9XG4gICAgICAgICAgTGlzdEhlYWRlckNvbXBvbmVudD17TGlzdEhlYWRlckNvbXBvbmVudH1cbiAgICAgICAgICByZW5kZXJJdGVtPXt0aGlzLnR0LnJlbmRlckl0ZW19XG4gICAgICAgICAgc2hvd3NIb3Jpem9udGFsU2Nyb2xsSW5kaWNhdG9yXG4gICAgICAgICAgc3R5bGU9e2ZsYXRMaXN0U3R5bGV9XG4gICAgICAgICAgey4uLnJlc3RQcm9wc31cbiAgICAgICAgLz5cbiAgICAgIDwvVGFibGVDb250ZXh0LlByb3ZpZGVyPlxuICAgIClcblxuICAgIHJldHVybiAoXG4gICAgICA8PlxuICAgICAgICB7ZmlsdGVyQ29udGVudCAmJiBmaWx0ZXJDYXJkICYmXG4gICAgICAgICAgPENhcmQgY2xhc3NOYW1lPVwibGl2ZS10YWJsZS0tZmlsdGVyLWNhcmQgbWItNFwiPlxuICAgICAgICAgICAge3RoaXMuZmlsdGVyRm9ybSgpfVxuICAgICAgICAgIDwvQ2FyZD5cbiAgICAgICAgfVxuICAgICAgICB7ZmlsdGVyQ29udGVudCAmJiAhZmlsdGVyQ2FyZCAmJlxuICAgICAgICAgIHRoaXMuZmlsdGVyRm9ybSgpXG4gICAgICAgIH1cbiAgICAgICAge2NhcmQgJiZcbiAgICAgICAgICA8Q2FyZFxuICAgICAgICAgICAgY2xhc3NOYW1lPXtjbGFzc05hbWVzKFwibGl2ZS10YWJsZS0tdGFibGUtY2FyZFwiLCBcIm1iLTRcIiwgY2xhc3NOYW1lKX1cbiAgICAgICAgICAgIGNvbnRyb2xzPXt0aGlzLnRhYmxlQ29udHJvbHMoKX1cbiAgICAgICAgICAgIGhlYWRlcj17aGVhZGVyQ29udGVudH1cbiAgICAgICAgICAgIGZvb3Rlcj17dGhpcy50YWJsZUZvb3RlcigpfVxuICAgICAgICAgICAgey4uLnJlc3RQcm9wc31cbiAgICAgICAgICA+XG4gICAgICAgICAgICB7ZmxhdExpc3R9XG4gICAgICAgICAgPC9DYXJkPlxuICAgICAgICB9XG4gICAgICAgIHshY2FyZCAmJiBmbGF0TGlzdH1cbiAgICAgICAge3Jlc3VsdCAmJiBQYWdpbmF0aW9uQ29tcG9uZW50ICYmXG4gICAgICAgICAgPFBhZ2luYXRpb25Db21wb25lbnQgcmVzdWx0PXtyZXN1bHR9IC8+XG4gICAgICAgIH1cbiAgICAgICAge3Jlc3VsdCAmJiBwYWdpbmF0ZUNvbnRlbnQgJiZcbiAgICAgICAgICBwYWdpbmF0ZUNvbnRlbnQoe3Jlc3VsdH0pXG4gICAgICAgIH1cbiAgICAgIDwvPlxuICAgIClcbiAgfVxuXG4gIG9uQ29udGFpbmVyTGF5b3V0ID0gKGUpID0+IHtcbiAgICBjb25zdCB7d2lkdGh9ID0gZS5uYXRpdmVFdmVudC5sYXlvdXRcbiAgICBjb25zdCB7d2lkdGhzfSA9IHRoaXMuc1xuXG4gICAgdGhpcy5zZXRTdGF0ZSh7d2lkdGh9KVxuICAgIGlmICh3aWR0aHMpIHdpZHRocy50YWJsZVdpZHRoID0gd2lkdGhcbiAgfVxuXG4gIG9uTGlua3NDcmVhdGVkID0gKHthcmdzfSkgPT4ge1xuICAgIGNvbnN0IG1vZGVsQ2xhc3NOYW1lID0gdGhpcy5wLm1vZGVsQ2xhc3MubW9kZWxDbGFzc0RhdGEoKS5uYW1lXG5cbiAgICBpZiAoYXJncy5jcmVhdGVkW21vZGVsQ2xhc3NOYW1lXSkge1xuICAgICAgY29uc3QgYW1vdW50Q3JlYXRlZCA9IGFyZ3MuY3JlYXRlZFttb2RlbENsYXNzTmFtZV0ubGVuZ3RoXG5cbiAgICAgIHRoaXMuc2V0U3RhdGUoKHByZXZTdGF0ZSkgPT4gKHtcbiAgICAgICAgY3VycmVudFdvcmtwbGFjZUNvdW50OiBwcmV2U3RhdGUuY3VycmVudFdvcmtwbGFjZUNvdW50ICsgYW1vdW50Q3JlYXRlZFxuICAgICAgfSkpXG4gICAgfVxuICB9XG5cbiAgb25MaW5rc0Rlc3Ryb3llZCA9ICh7YXJnc30pID0+IHtcbiAgICBjb25zdCBtb2RlbENsYXNzTmFtZSA9IHRoaXMucC5tb2RlbENsYXNzLm1vZGVsQ2xhc3NEYXRhKCkubmFtZVxuXG4gICAgaWYgKGFyZ3MuZGVzdHJveWVkW21vZGVsQ2xhc3NOYW1lXSkge1xuICAgICAgY29uc3QgYW1vdW50RGVzdHJveWVkID0gYXJncy5kZXN0cm95ZWRbbW9kZWxDbGFzc05hbWVdLmxlbmd0aFxuXG4gICAgICB0aGlzLnNldFN0YXRlKChwcmV2U3RhdGUpID0+ICh7XG4gICAgICAgIGN1cnJlbnRXb3JrcGxhY2VDb3VudDogcHJldlN0YXRlLmN1cnJlbnRXb3JrcGxhY2VDb3VudCAtIGFtb3VudERlc3Ryb3llZFxuICAgICAgfSkpXG4gICAgfVxuICB9XG5cbiAga2V5RXh0cmF0b3IgPSAobW9kZWwpID0+IGAke3RoaXMucy50YWJsZVNldHRpbmdGdWxsQ2FjaGVLZXl9LSR7bW9kZWwuaWQoKX1gXG5cbiAgZmlsdGVyRm9ybSA9ICgpID0+IHtcbiAgICBjb25zdCB7ZmlsdGVyRm9ybVJlZiwgc3VibWl0RmlsdGVyLCBzdWJtaXRGaWx0ZXJEZWJvdW5jZX0gPSB0aGlzLnR0XG4gICAgY29uc3Qge2ZpbHRlckNvbnRlbnQsIGZpbHRlclN1Ym1pdEJ1dHRvbn0gPSB0aGlzLnBcbiAgICBjb25zdCB7cXVlcnlRTmFtZX0gPSB0aGlzLnNcbiAgICBjb25zdCB7ZmlsdGVyU3VibWl0TGFiZWx9ID0gdGhpcy5wcm9wc1xuICAgIGNvbnN0IHtxUGFyYW1zfSA9IGRpZ3ModGhpcy5jb2xsZWN0aW9uLCBcInFQYXJhbXNcIilcblxuICAgIHJldHVybiAoXG4gICAgICA8Rm9ybSBjbGFzc05hbWU9XCJsaXZlLXRhYmxlLS1maWx0ZXItZm9ybVwiIGZvcm1SZWY9e2ZpbHRlckZvcm1SZWZ9IG9uU3VibWl0PXt0aGlzLnR0Lm9uRmlsdGVyRm9ybVN1Ym1pdH0gc2V0Rm9ybT17dGhpcy5zZXRTdGF0ZXMuZmlsdGVyRm9ybX0+XG4gICAgICAgIHtcInNcIiBpbiBxUGFyYW1zICYmXG4gICAgICAgICAgPGlucHV0IG5hbWU9XCJzXCIgdHlwZT1cImhpZGRlblwiIHZhbHVlPXtxUGFyYW1zLnN9IC8+XG4gICAgICAgIH1cbiAgICAgICAge2ZpbHRlckNvbnRlbnQoe1xuICAgICAgICAgIG9uRmlsdGVyQ2hhbmdlZDogc3VibWl0RmlsdGVyLFxuICAgICAgICAgIG9uRmlsdGVyQ2hhbmdlZFdpdGhEZWxheTogc3VibWl0RmlsdGVyRGVib3VuY2UsXG4gICAgICAgICAgcVBhcmFtcyxcbiAgICAgICAgICBxdWVyeVFOYW1lXG4gICAgICAgIH0pfVxuICAgICAgICB7ZmlsdGVyU3VibWl0QnV0dG9uICYmXG4gICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICBjbGFzc05hbWU9XCJidG4gYnRuLXByaW1hcnkgbGl2ZS10YWJsZS0tc3VibWl0LWZpbHRlci1idXR0b25cIlxuICAgICAgICAgICAgdHlwZT1cInN1Ym1pdFwiXG4gICAgICAgICAgICBzdHlsZT17e21hcmdpblRvcDogXCI4cHhcIn19XG4gICAgICAgICAgICB2YWx1ZT17ZmlsdGVyU3VibWl0TGFiZWwgfHwgdGhpcy50KFwiLmZpbHRlclwiLCB7ZGVmYXVsdFZhbHVlOiBcIkZpbHRlclwifSl9XG4gICAgICAgICAgLz5cbiAgICAgICAgfVxuICAgICAgPC9Gb3JtPlxuICAgIClcbiAgfVxuXG4gIG9uRmlsdGVyQ2xpY2tlZCA9IChlKSA9PiB7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgdGhpcy5zZXRTdGF0ZSh7c2hvd0ZpbHRlcnM6ICF0aGlzLnN0YXRlLnNob3dGaWx0ZXJzfSlcbiAgfVxuXG4gIG9uUGVyUGFnZUNoYW5nZWQgPSAoZSkgPT4ge1xuICAgIGNvbnN0IHtxdWVyeU5hbWV9ID0gdGhpcy5zXG4gICAgY29uc3QgbmV3UGVyUGFnZVZhbHVlID0gZGlnZyhlLCBcInRhcmdldFwiLCBcInZhbHVlXCIpXG4gICAgY29uc3QgcGVyS2V5ID0gYCR7cXVlcnlOYW1lfV9wZXJgXG4gICAgY29uc3QgcGFyYW1zQ2hhbmdlID0ge31cblxuICAgIHBhcmFtc0NoYW5nZVtwZXJLZXldID0gbmV3UGVyUGFnZVZhbHVlXG5cbiAgICBQYXJhbXMuY2hhbmdlUGFyYW1zKHBhcmFtc0NoYW5nZSlcbiAgfVxuXG4gIHJlbmRlckl0ZW0gPSAoe2luZGV4LCBpdGVtOiBtb2RlbH0pID0+IHtcbiAgICBpZiAoIXRoaXMucy50YWJsZVNldHRpbmdMb2FkZWQpIHtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIDxWaWV3PlxuICAgICAgICAgIDxUZXh0PlxuICAgICAgICAgICAge3RoaXMudChcIi5sb2FkaW5nX2RvdF9kb3RfZG90XCIsIHtkZWZhdWx0VmFsdWU6IFwiTG9hZGluZy4uLlwifSl9XG4gICAgICAgICAgPC9UZXh0PlxuICAgICAgICA8L1ZpZXc+XG4gICAgICApXG4gICAgfVxuXG4gICAgcmV0dXJuIChcbiAgICAgIDxNb2RlbFJvd1xuICAgICAgICBjYWNoZUtleT17bW9kZWwuY2FjaGVLZXkoKX1cbiAgICAgICAgY29sdW1ucz17dGhpcy5zLmNvbHVtbnNUb1Nob3d9XG4gICAgICAgIGNvbHVtbldpZHRocz17dGhpcy5jb2x1bW5XaWR0aHMoKX1cbiAgICAgICAgZXZlbnRzPXt0aGlzLnR0LmV2ZW50c31cbiAgICAgICAgaW5kZXg9e2luZGV4fVxuICAgICAgICBrZXk9e21vZGVsLmlkKCl9XG4gICAgICAgIG1vZGVsPXttb2RlbH1cbiAgICAgICAgdGFibGU9e3RoaXN9XG4gICAgICAgIHRhYmxlU2V0dGluZ0Z1bGxDYWNoZUtleT17dGhpcy5zLnRhYmxlU2V0dGluZ0Z1bGxDYWNoZUtleX1cbiAgICAgIC8+XG4gICAgKVxuICB9XG5cbiAgc3R5bGVGb3JDb2x1bW4gPSAoe2NvbHVtbiwgY29sdW1uSW5kZXgsIGV2ZW4sIHN0eWxlLCB0eXBlfSkgPT4ge1xuICAgIGNvbnN0IHtzdHlsZVVJfSA9IHRoaXMucFxuICAgIGNvbnN0IGRlZmF1bHRTdHlsZSA9IHtcbiAgICAgIGp1c3RpZnlDb250ZW50OiBcImNlbnRlclwiLFxuICAgICAgcGFkZGluZzogOCxcbiAgICAgIG92ZXJmbG93OiBcImhpZGRlblwiXG4gICAgfVxuXG4gICAgaWYgKHN0eWxlVUkpIHtcbiAgICAgIE9iamVjdC5hc3NpZ24oZGVmYXVsdFN0eWxlLCB7XG4gICAgICAgIGJhY2tncm91bmRDb2xvcjogZXZlbiA/IFwiI2Y1ZjVmNVwiIDogXCIjZmZmXCJcbiAgICAgIH0pXG4gICAgfVxuXG4gICAgaWYgKHR5cGUgPT0gXCJhY3Rpb25zXCIpIHtcbiAgICAgIGRlZmF1bHRTdHlsZS5mbGV4RGlyZWN0aW9uID0gXCJyb3dcIlxuICAgICAgZGVmYXVsdFN0eWxlLmFsaWduSXRlbXMgPSBcImNlbnRlclwiXG5cbiAgICAgIGlmICh0aGlzLnR0Lm1kVXApIHtcbiAgICAgICAgZGVmYXVsdFN0eWxlLm1hcmdpbkxlZnQgPSBcImF1dG9cIlxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZGVmYXVsdFN0eWxlLm1hcmdpblJpZ2h0ID0gXCJhdXRvXCJcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKHRoaXMudHQubWRVcCAmJiBzdHlsZVVJKSB7XG4gICAgICBkZWZhdWx0U3R5bGUuYm9yZGVyUmlnaHQgPSBcIjFweCBzb2xpZCAjZGJkYmRiXCJcbiAgICB9XG5cbiAgICBjb25zdCBhY3R1YWxTdHlsZSA9IE9iamVjdC5hc3NpZ24oXG4gICAgICBkZWZhdWx0U3R5bGUsXG4gICAgICBzdHlsZVxuICAgIClcblxuICAgIHJldHVybiBhY3R1YWxTdHlsZVxuICB9XG5cbiAgc3R5bGVGb3JIZWFkZXIgPSAoe2NvbHVtbiwgY29sdW1uSW5kZXgsIHN0eWxlLCB0eXBlfSkgPT4ge1xuICAgIGNvbnN0IHttZFVwfSA9IHRoaXMudHRcbiAgICBjb25zdCBkZWZhdWx0U3R5bGUgPSB7XG4gICAgICBmbGV4RGlyZWN0aW9uOiBcInJvd1wiLFxuICAgICAgYWxpZ25JdGVtczogXCJjZW50ZXJcIixcbiAgICAgIHBhZGRpbmc6IDhcbiAgICB9XG5cbiAgICBpZiAodHlwZSAhPSBcImFjdGlvbnNcIiAmJiBtZFVwICYmIHRoaXMucC5zdHlsZVVJKSB7XG4gICAgICBkZWZhdWx0U3R5bGUuYm9yZGVyUmlnaHQgPSBcIjFweCBzb2xpZCAjZGJkYmRiXCJcbiAgICB9XG5cbiAgICBjb25zdCBhY3R1YWxTdHlsZSA9IE9iamVjdC5hc3NpZ24oXG4gICAgICBkZWZhdWx0U3R5bGUsXG4gICAgICBzdHlsZVxuICAgIClcblxuICAgIHJldHVybiBhY3R1YWxTdHlsZVxuICB9XG5cbiAgc3R5bGVGb3JIZWFkZXJUZXh0KCkge1xuICAgIGNvbnN0IGFjdHVhbFN0eWxlID0ge2ZvbnRXZWlnaHQ6IFwiYm9sZFwifVxuXG4gICAgcmV0dXJuIGFjdHVhbFN0eWxlXG4gIH1cblxuICBzdHlsZUZvclJvdyA9ICh7ZXZlbn0gPSB7fSkgPT4ge1xuICAgIGNvbnN0IGFjdHVhbFN0eWxlID0ge1xuICAgICAgZmxleDogMSxcbiAgICAgIGFsaWduSXRlbXM6IFwic3RyZXRjaFwiXG4gICAgfVxuXG4gICAgaWYgKGV2ZW4gJiYgdGhpcy5wLnN0eWxlVUkpIHtcbiAgICAgIGFjdHVhbFN0eWxlLmJhY2tncm91bmRDb2xvciA9IFwiI2Y1ZjVmNVwiXG4gICAgfVxuXG4gICAgcmV0dXJuIGFjdHVhbFN0eWxlXG4gIH1cblxuICBzdHlsZUZvclJvd0hlYWRlciA9ICgpID0+IHtcbiAgICBjb25zdCBhY3R1YWxTdHlsZSA9IHtcbiAgICAgIGZsZXg6IDEsXG4gICAgICBhbGlnbkl0ZW1zOiBcInN0cmV0Y2hcIlxuICAgIH1cblxuICAgIHJldHVybiBhY3R1YWxTdHlsZVxuICB9XG5cbiAgdGFibGVDb250cm9scygpIHtcbiAgICBjb25zdCB7Y29udHJvbHN9ID0gdGhpcy5wcm9wc1xuICAgIGNvbnN0IHtzaG93U2V0dGluZ3N9ID0gdGhpcy5zXG4gICAgY29uc3Qge21vZGVscywgcVBhcmFtcywgcXVlcnksIHJlc3VsdH0gPSBkaWdzKHRoaXMuY29sbGVjdGlvbiwgXCJtb2RlbHNcIiwgXCJxUGFyYW1zXCIsIFwicXVlcnlcIiwgXCJyZXN1bHRcIilcblxuICAgIHJldHVybiAoXG4gICAgICA8VmlldyBzdHlsZT17dGhpcy5jYWNoZShcInRhYmxlQ29udHJvbHNSb290Vmlld1N0eWxlXCIsIHtmbGV4RGlyZWN0aW9uOiBcInJvd1wifSl9PlxuICAgICAgICB7Y29udHJvbHMgJiYgY29udHJvbHMoe21vZGVscywgcVBhcmFtcywgcXVlcnksIHJlc3VsdH0pfVxuICAgICAgICA8UHJlc3NhYmxlIGRhdGFTZXQ9e3tjbGFzczogXCJmaWx0ZXItYnV0dG9uXCJ9fSBvblByZXNzPXt0aGlzLnR0Lm9uRmlsdGVyQ2xpY2tlZH0+XG4gICAgICAgICAgPEljb24gbmFtZT1cInNlYXJjaFwiIHNpemU9ezIwfSAvPlxuICAgICAgICA8L1ByZXNzYWJsZT5cbiAgICAgICAgPFZpZXc+XG4gICAgICAgICAge3Nob3dTZXR0aW5ncyAmJlxuICAgICAgICAgICAgPFNldHRpbmdzIG9uUmVxdWVzdENsb3NlPXt0aGlzLnR0Lm9uUmVxdWVzdENsb3NlU2V0dGluZ3N9IHRhYmxlPXt0aGlzfSAvPlxuICAgICAgICAgIH1cbiAgICAgICAgICA8UHJlc3NhYmxlIGRhdGFTZXQ9e3RoaXMuY2FjaGUoXCJzZXR0aW5nc0J1dHRvbkRhdGFTZXRcIiwge2NsYXNzOiBcInNldHRpbmdzLWJ1dHRvblwifSl9IG9uUHJlc3M9e3RoaXMudHQub25TZXR0aW5nc0NsaWNrZWR9PlxuICAgICAgICAgICAgPEljb24gbmFtZT1cImdlYXJcIiBzaXplPXsyMH0gLz5cbiAgICAgICAgICA8L1ByZXNzYWJsZT5cbiAgICAgICAgPC9WaWV3PlxuICAgICAgPC9WaWV3PlxuICAgIClcbiAgfVxuXG4gIHRhYmxlRm9vdGVyKCkge1xuICAgIGNvbnN0IHtyZXN1bHR9ID0gZGlncyh0aGlzLmNvbGxlY3Rpb24sIFwicmVzdWx0XCIpXG4gICAgY29uc3QgY3VycmVudFBhZ2UgPSByZXN1bHQuY3VycmVudFBhZ2UoKVxuICAgIGNvbnN0IHRvdGFsQ291bnQgPSByZXN1bHQudG90YWxDb3VudCgpXG4gICAgY29uc3QgcGVyUGFnZSA9IHJlc3VsdC5wZXJQYWdlKClcbiAgICBjb25zdCB0byA9IE1hdGgubWluKGN1cnJlbnRQYWdlICogcGVyUGFnZSwgdG90YWxDb3VudClcbiAgICBjb25zdCBkZWZhdWx0VmFsdWUgPSBcIlNob3dpbmcgJXtmcm9tfSB0byAle3RvfSBvdXQgb2YgJXt0b3RhbF9jb3VudH0gdG90YWwuXCJcbiAgICBsZXQgZnJvbSA9ICgoY3VycmVudFBhZ2UgLSAxKSAqIHBlclBhZ2UpICsgMVxuXG4gICAgaWYgKHRvID09PSAwKSBmcm9tID0gMFxuXG4gICAgcmV0dXJuIChcbiAgICAgIDxWaWV3IHN0eWxlPXt0aGlzLmNhY2hlKFwidGFibGVGb290ZXJSb290Vmlld1N0eWxlXCIsIHtmbGV4RGlyZWN0aW9uOiBcInJvd1wiLCBqdXN0aWZ5Q29udGVudDogXCJzcGFjZS1iZXR3ZWVuXCIsIG1hcmdpblRvcDogMTB9KX0+XG4gICAgICAgIDxWaWV3IGRhdGFTZXQ9e3RoaXMuY2FjaGUoXCJzaG93aW5nQ291bnRzRGF0YVNldFwiLCB7Y2xhc3M6IFwic2hvd2luZy1jb3VudHNcIn0pfSBzdHlsZT17dGhpcy5jYWNoZShcInNob3dpbmdDb3VudHNTdHlsZVwiLCB7ZmxleERpcmVjdGlvbjogXCJyb3dcIn0pfT5cbiAgICAgICAgICA8VGV4dD5cbiAgICAgICAgICAgIHt0aGlzLnQoXCIuc2hvd2luZ19mcm9tX3RvX291dF9vZl90b3RhbFwiLCB7ZGVmYXVsdFZhbHVlLCBmcm9tLCB0bywgdG90YWxfY291bnQ6IHRvdGFsQ291bnR9KX1cbiAgICAgICAgICA8L1RleHQ+XG4gICAgICAgICAge3RoaXMucC53b3JrcGxhY2UgJiYgdGhpcy5zLmN1cnJlbnRXb3JrcGxhY2VDb3VudCAhPT0gbnVsbCAmJlxuICAgICAgICAgICAgPFRleHQgc3R5bGU9e3RoaXMuY2FjaGUoXCJ4U2VsZWN0ZWRUZXh0U3R5bGVcIiwge21hcmdpbkxlZnQ6IDN9KX0+XG4gICAgICAgICAgICAgIHt0aGlzLnQoXCIueF9zZWxlY3RlZFwiLCB7ZGVmYXVsdFZhbHVlOiBcIiV7c2VsZWN0ZWR9IHNlbGVjdGVkLlwiLCBzZWxlY3RlZDogdGhpcy5zLmN1cnJlbnRXb3JrcGxhY2VDb3VudH0pfVxuICAgICAgICAgICAgPC9UZXh0PlxuICAgICAgICAgIH1cbiAgICAgICAgPC9WaWV3PlxuICAgICAgICA8Vmlldz5cbiAgICAgICAgICA8U2VsZWN0XG4gICAgICAgICAgICBjbGFzc05hbWU9XCJwZXItcGFnZS1zZWxlY3RcIlxuICAgICAgICAgICAgZGVmYXVsdFZhbHVlPXtwZXJQYWdlfVxuICAgICAgICAgICAgb25DaGFuZ2U9e3RoaXMudHQub25QZXJQYWdlQ2hhbmdlZH1cbiAgICAgICAgICAgIG9wdGlvbnM9e3BhZ2luYXRpb25PcHRpb25zfVxuICAgICAgICAgIC8+XG4gICAgICAgIDwvVmlldz5cbiAgICAgIDwvVmlldz5cbiAgICApXG4gIH1cblxuICBjbGFzc05hbWUoKSB7XG4gICAgY29uc3QgY2xhc3NOYW1lcyA9IFtcImFwaS1tYWtlci0tdGFibGVcIl1cblxuICAgIGlmICh0aGlzLnByb3BzLmNsYXNzTmFtZSkge1xuICAgICAgY2xhc3NOYW1lcy5wdXNoKHRoaXMucHJvcHMuY2xhc3NOYW1lKVxuICAgIH1cblxuICAgIHJldHVybiBjbGFzc05hbWVzLmpvaW4oXCIgXCIpXG4gIH1cblxuICBjb2x1bW5Qcm9wcyhjb2x1bW4pIHtcbiAgICBjb25zdCBwcm9wcyA9IHt9XG5cbiAgICBpZiAoY29sdW1uLnRleHRDZW50ZXIpIHtcbiAgICAgIHByb3BzLnN0eWxlIHx8PSB7fVxuICAgICAgcHJvcHMuc3R5bGUudGV4dEFsaWduID0gXCJjZW50ZXJcIlxuICAgIH1cblxuICAgIGlmIChjb2x1bW4udGV4dFJpZ2h0KSB7XG4gICAgICBwcm9wcy5zdHlsZSB8fD0ge31cbiAgICAgIHByb3BzLnN0eWxlLnRleHRBbGlnbiA9IFwicmlnaHRcIlxuICAgIH1cblxuICAgIHJldHVybiBwcm9wc1xuICB9XG5cbiAgaGVhZGVyUHJvcHMoY29sdW1uKSB7XG4gICAgY29uc3QgcHJvcHMgPSB7fVxuXG4gICAgaWYgKGNvbHVtbi50ZXh0Q2VudGVyKSB7XG4gICAgICBwcm9wcy5zdHlsZSB8fD0ge31cbiAgICAgIHByb3BzLnN0eWxlLmp1c3RpZnlDb250ZW50ID0gXCJjZW50ZXJcIlxuICAgIH1cblxuICAgIGlmIChjb2x1bW4udGV4dFJpZ2h0KSB7XG4gICAgICBwcm9wcy5zdHlsZSB8fD0ge31cbiAgICAgIHByb3BzLnN0eWxlLmp1c3RpZnlDb250ZW50ID0gXCJlbmRcIlxuICAgIH1cblxuICAgIHJldHVybiBwcm9wc1xuICB9XG5cbiAgY29sdW1uV2lkdGhzKCkge1xuICAgIGNvbnN0IGNvbHVtbldpZHRocyA9IHt9XG5cbiAgICBmb3IgKGNvbnN0IGNvbHVtbiBvZiB0aGlzLnMucHJlcGFyZWRDb2x1bW5zKSB7XG4gICAgICBjb2x1bW5XaWR0aHNbY29sdW1uLnRhYmxlU2V0dGluZ0NvbHVtbi5pZGVudGlmaWVyKCldID0gY29sdW1uLndpZHRoXG4gICAgfVxuXG4gICAgcmV0dXJuIGNvbHVtbldpZHRoc1xuICB9XG5cbiAgaGVhZGVyc0NvbnRlbnRGcm9tQ29sdW1ucyA9ICgpID0+IHtcbiAgICByZXR1cm4gKFxuICAgICAgPERyYWdnYWJsZVNvcnRcbiAgICAgICAgZGF0YT17dGhpcy5zLmNvbHVtbnNUb1Nob3d9XG4gICAgICAgIGV2ZW50cz17dGhpcy50dC5kcmFnZ2FibGVTb3J0RXZlbnRzfVxuICAgICAgICBob3Jpem9udGFsXG4gICAgICAgIGtleUV4dHJhY3Rvcj17dGhpcy50dC5kcmFnTGlzdGtleUV4dHJhY3Rvcn1cbiAgICAgICAgb25JdGVtTW92ZWQ9e3RoaXMudHQub25JdGVtTW92ZWR9XG4gICAgICAgIG9uUmVvcmRlcmVkPXt0aGlzLnR0Lm9uUmVvcmRlcmVkfVxuICAgICAgICByZW5kZXJJdGVtPXt0aGlzLnR0LmRyYWdMaXN0UmVuZGVySXRlbUNvbnRlbnR9XG4gICAgICAvPlxuICAgIClcbiAgfVxuXG4gIGRyYWdMaXN0Q2FjaGVLZXlFeHRyYWN0b3IgPSAoaXRlbSkgPT4gYCR7aXRlbS50YWJsZVNldHRpbmdDb2x1bW4uaWRlbnRpZmllcigpfS0ke3RoaXMucy5yZXNpemluZ31gXG4gIGRyYWdMaXN0a2V5RXh0cmFjdG9yID0gKGl0ZW0pID0+IGl0ZW0udGFibGVTZXR0aW5nQ29sdW1uLmlkZW50aWZpZXIoKVxuXG4gIG9uSXRlbU1vdmVkID0gKHthbmltYXRpb25BcmdzLCBpdGVtSW5kZXgsIHgsIHl9KSA9PiB7XG4gICAgY29uc3QgYW5pbWF0ZWRQb3NpdGlvbiA9IGRpZ2codGhpcywgXCJzXCIsIFwiY29sdW1uc1RvU2hvd1wiLCBpdGVtSW5kZXgsIFwiYW5pbWF0ZWRQb3NpdGlvblwiKVxuXG4gICAgaWYgKGFuaW1hdGlvbkFyZ3MpIHtcbiAgICAgIEFuaW1hdGVkLnRpbWluZyhhbmltYXRlZFBvc2l0aW9uLCBhbmltYXRpb25BcmdzKS5zdGFydCgpXG4gICAgfSBlbHNlIHtcbiAgICAgIGFuaW1hdGVkUG9zaXRpb24uc2V0VmFsdWUoe3gsIHl9KVxuICAgIH1cbiAgfVxuXG4gIG9uUmVvcmRlcmVkID0gYXN5bmMgKHtmcm9tSXRlbSwgZnJvbVBvc2l0aW9uLCB0b0l0ZW0sIHRvUG9zaXRpb259KSA9PiB7XG4gICAgaWYgKGZyb21Qb3NpdGlvbiA9PSB0b1Bvc2l0aW9uKSByZXR1cm4gLy8gT25seSBkbyByZXF1ZXN0cyBhbmQgcXVlcmllcyBpZiBjaGFuZ2VkXG5cbiAgICBjb25zdCBUYWJsZVNldHRpbmdDb2x1bW4gPSBmcm9tSXRlbS50YWJsZVNldHRpbmdDb2x1bW4uY29uc3RydWN0b3JcbiAgICBjb25zdCB0b0NvbHVtbiA9IGF3YWl0IFRhYmxlU2V0dGluZ0NvbHVtbi5maW5kKHRvSXRlbS50YWJsZVNldHRpbmdDb2x1bW4uaWQoKSkgLy8gTmVlZCB0byBsb2FkIGxhdGVzdCBwb3NpdGlvbiBiZWNhdXNlIEFjdHNBc0xpc3QgbWlnaHQgaGF2ZSBjaGFuZ2VkIGl0XG5cbiAgICBhd2FpdCBmcm9tSXRlbS50YWJsZVNldHRpbmdDb2x1bW4udXBkYXRlKHtwb3NpdGlvbjogdG9Db2x1bW4ucG9zaXRpb24oKX0pXG4gIH1cblxuICBkcmFnTGlzdFJlbmRlckl0ZW1Db250ZW50ID0gKHtpc0FjdGl2ZSwgaXRlbSwgdG91Y2hQcm9wc30pID0+IHtcbiAgICBjb25zdCB7YW5pbWF0ZWRXaWR0aCwgYW5pbWF0ZWRaSW5kZXgsIGNvbHVtbiwgdGFibGVTZXR0aW5nQ29sdW1ufSA9IGl0ZW1cblxuICAgIHJldHVybiAoXG4gICAgICA8SGVhZGVyQ29sdW1uXG4gICAgICAgIGFjdGl2ZT17aXNBY3RpdmV9XG4gICAgICAgIGFuaW1hdGVkV2lkdGg9e2FuaW1hdGVkV2lkdGh9XG4gICAgICAgIGFuaW1hdGVkWkluZGV4PXthbmltYXRlZFpJbmRleH1cbiAgICAgICAgY29sdW1uPXtjb2x1bW59XG4gICAgICAgIGtleT17dGFibGVTZXR0aW5nQ29sdW1uLmlkZW50aWZpZXIoKX1cbiAgICAgICAgcmVzaXppbmc9e3RoaXMucy5yZXNpemluZ31cbiAgICAgICAgdGFibGU9e3RoaXN9XG4gICAgICAgIHRhYmxlU2V0dGluZ0NvbHVtbj17dGFibGVTZXR0aW5nQ29sdW1ufVxuICAgICAgICB0b3VjaFByb3BzPXt0b3VjaFByb3BzfVxuICAgICAgICB3aWR0aHM9e3RoaXMucy53aWR0aHN9XG4gICAgICAvPlxuICAgIClcbiAgfVxuXG4gIGhlYWRlckNsYXNzTmFtZUZvckNvbHVtbihjb2x1bW4pIHtcbiAgICBjb25zdCBjbGFzc05hbWVzID0gW11cblxuICAgIGlmIChjb2x1bW4uY29tbW9uUHJvcHMgJiYgY29sdW1uLmNvbW1vblByb3BzLmNsYXNzTmFtZSkgY2xhc3NOYW1lcy5wdXNoKGNvbHVtbi5jb21tb25Qcm9wcy5jbGFzc05hbWUpXG4gICAgaWYgKGNvbHVtbi5oZWFkZXJQcm9wcyAmJiBjb2x1bW4uaGVhZGVyUHJvcHMuY2xhc3NOYW1lKSBjbGFzc05hbWVzLnB1c2goY29sdW1uLmhlYWRlclByb3BzLmNsYXNzTmFtZSlcblxuICAgIHJldHVybiBjbGFzc05hbWVzXG4gIH1cblxuICBoZWFkZXJMYWJlbEZvckNvbHVtbihjb2x1bW4pIHtcbiAgICBjb25zdCB7bW9kZWxDbGFzc30gPSB0aGlzLnBcblxuICAgIGlmIChcImxhYmVsXCIgaW4gY29sdW1uKSB7XG4gICAgICBpZiAodHlwZW9mIGNvbHVtbi5sYWJlbCA9PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgcmV0dXJuIGNvbHVtbi5sYWJlbCgpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gY29sdW1uLmxhYmVsXG4gICAgICB9XG4gICAgfVxuXG4gICAgbGV0IGN1cnJlbnRNb2RlbENsYXNzID0gbW9kZWxDbGFzc1xuXG4gICAgLy8gQ2FsY3VsYXRlIGN1cnJlbnQgbW9kZWwgY2xhc3MgdGhyb3VnaCBwYXRoXG4gICAgaWYgKGNvbHVtbi5wYXRoKSB7XG4gICAgICBmb3IgKGNvbnN0IHBhdGhQYXJ0IG9mIGNvbHVtbi5wYXRoKSB7XG4gICAgICAgIGNvbnN0IHJlbGF0aW9uc2hpcHMgPSBkaWdnKGN1cnJlbnRNb2RlbENsYXNzLm1vZGVsQ2xhc3NEYXRhKCksIFwicmVsYXRpb25zaGlwc1wiKVxuICAgICAgICBjb25zdCByZWxhdGlvbnNoaXAgPSByZWxhdGlvbnNoaXBzLmZpbmQoKHJlbGF0aW9uc2hpcEluQXJyYXkpID0+IHJlbGF0aW9uc2hpcEluQXJyYXkubmFtZSA9PSBpbmZsZWN0aW9uLnVuZGVyc2NvcmUocGF0aFBhcnQpKVxuXG4gICAgICAgIGN1cnJlbnRNb2RlbENsYXNzID0gbW9kZWxDbGFzc1JlcXVpcmUoZGlnZyhyZWxhdGlvbnNoaXAsIFwicmVzb3VyY2VfbmFtZVwiKSlcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoY29sdW1uLmF0dHJpYnV0ZSkgcmV0dXJuIGN1cnJlbnRNb2RlbENsYXNzLmh1bWFuQXR0cmlidXRlTmFtZShjb2x1bW4uYXR0cmlidXRlKVxuXG4gICAgdGhyb3cgbmV3IEVycm9yKFwiTm8gJ2xhYmVsJyBvciAnYXR0cmlidXRlJyB3YXMgZ2l2ZW5cIilcbiAgfVxuXG4gIG9uRmlsdGVyRm9ybVN1Ym1pdCA9ICgpID0+IHRoaXMuc3VibWl0RmlsdGVyKClcbiAgb25SZXF1ZXN0Q2xvc2VTZXR0aW5ncyA9ICgpID0+IHRoaXMuc2V0U3RhdGUoe3Nob3dTZXR0aW5nczogZmFsc2V9KVxuXG4gIG9uU2V0dGluZ3NDbGlja2VkID0gKGUpID0+IHtcbiAgICBlLnByZXZlbnREZWZhdWx0KClcblxuICAgIHRoaXMuc2V0U3RhdGUoe3Nob3dTZXR0aW5nczogIXRoaXMucy5zaG93U2V0dGluZ3N9KVxuICB9XG5cbiAgc3VibWl0RmlsdGVyID0gKCkgPT4ge1xuICAgIGNvbnN0IHthcHBIaXN0b3J5fSA9IHRoaXMucHJvcHNcbiAgICBjb25zdCB7cXVlcnlRTmFtZX0gPSB0aGlzLnNcbiAgICBjb25zdCBjaGFuZ2VQYXJhbXNQYXJhbXMgPSB7fVxuICAgIGNvbnN0IHFQYXJhbXMgPSB0aGlzLnMuZmlsdGVyRm9ybS5hc09iamVjdCgpXG5cbiAgICBpZiAoUGxhdGZvcm0uT1MgPT0gXCJ3ZWJcIikge1xuICAgICAgY29uc3QgZmlsdGVyRm9ybSA9IGRpZ2codGhpcy50dC5maWx0ZXJGb3JtUmVmLCBcImN1cnJlbnRcIilcbiAgICAgIGNvbnN0IG5hdnRpdmVGb3JtUGFyYW1zID0gUGFyYW1zLnNlcmlhbGl6ZUZvcm0oZmlsdGVyRm9ybSlcblxuICAgICAgaW5jb3Jwb3JhdGUocVBhcmFtcywgbmF2dGl2ZUZvcm1QYXJhbXMpXG4gICAgfVxuXG4gICAgY2hhbmdlUGFyYW1zUGFyYW1zW3F1ZXJ5UU5hbWVdID0gSlNPTi5zdHJpbmdpZnkocVBhcmFtcylcblxuICAgIFBhcmFtcy5jaGFuZ2VQYXJhbXMoY2hhbmdlUGFyYW1zUGFyYW1zLCB7YXBwSGlzdG9yeX0pXG4gIH1cblxuICBzdWJtaXRGaWx0ZXJEZWJvdW5jZSA9IGRlYm91bmNlKHRoaXMudHQuc3VibWl0RmlsdGVyKVxufSkpXG4iXX0=