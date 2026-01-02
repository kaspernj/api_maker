import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { digg, digs } from "diggerize";
import React, { createContext, useContext, useMemo, useRef } from "react";
import { Animated, Platform, Pressable, View } from "react-native";
import BaseComponent from "../base-component";
import Card from "../bootstrap/card";
import classNames from "classnames";
import Collection from "../collection.js";
import columnVisible from "./column-visible.js";
import debounce from "debounce";
import DraggableSort from "../draggable-sort/index";
import { EventEmitter } from "eventemitter3";
import Filters from "./filters/index";
import FlatList from "./components/flat-list";
import { Form } from "../form";
import Header from "./components/header";
import HeaderColumn from "./header-column";
import HeaderSelect from "./header-select";
import Icon from "../utils/icon";
import { incorporate } from "incorporator";
import * as inflection from "inflection";
import memo from "set-state-compare/build/memo.js";
import modelClassRequire from "../model-class-require.js";
import ModelRow from "./model-row";
import Paginate from "../bootstrap/paginate";
import Params from "../params.js";
import PropTypes from "prop-types";
import Row from "./components/row";
import selectCalculator from "./select-calculator.js";
import Select from "../inputs/select";
import Settings from "./settings/index";
import { shapeComponent } from "set-state-compare/build/shape-component.js";
import TableSettings from "./table-settings.js";
import Text from "../utils/text";
import uniqunize from "uniqunize";
import useBreakpoint from "../use-breakpoint.js";
import useCollection from "../use-collection.js";
import useI18n from "i18n-on-steroids/src/use-i18n.mjs";
import useEventEmitter from "../use-event-emitter.js";
import useModelEvent from "../use-model-event.js";
import useQueryParams from "on-location-changed/build/use-query-params.js";
import Widths from "./widths";
import WorkerPluginsCheckAllCheckbox from "./worker-plugins-check-all-checkbox";
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
        return (_jsxs(Row, { style: table.styleForRowHeader(), testID: "api-maker/table/header-row", children: [table.p.workplace && table.s.currentWorkplace &&
                    _jsxs(Header, { style: table.styleForHeader({ style: { width: mdUp ? 41 : undefined } }), children: [_jsx(WorkerPluginsCheckAllCheckbox, { currentWorkplace: table.s.currentWorkplace, query: queryWithoutPagination, style: this.cache("workerPlguinsCheckAllCheckboxStyle", { marginHorizontal: "auto" }) }), !mdUp &&
                                _jsx(Text, { style: this.cache("selectAllFoundTextStyle", { marginLeft: 3 }), children: t(".select_all_found", { defaultValue: "Select all found" }) })] }), !mdUp &&
                    _jsx(Header, { style: table.styleForHeader({ style: {} }), children: _jsx(HeaderSelect, { preparedColumns: table.s.preparedColumns, query: query, table: table }) }), mdUp &&
                    _jsxs(_Fragment, { children: [table.headersContentFromColumns(), _jsx(Header, { style: table.styleForHeader({ style: {}, type: "actions" }) })] })] }));
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
        return (_jsxs(View, { dataSet: this.cache("rootViewDataSet", { class: this.className() }, [this.className()]), onLayout: this.tt.onContainerLayout, style: this.props.styles?.container, children: [showNoRecordsAvailableContent &&
                    _jsx("div", { className: "live-table--no-records-available-content", children: noRecordsAvailableContent({ models, qParams, overallCount }) }), showNoRecordsFoundContent &&
                    _jsx("div", { className: "live-table--no-records-found-content", children: noRecordsFoundContent({ models, qParams, overallCount }) }), showFilters &&
                    _jsx(Filters, { currentUser: currentUser, modelClass: modelClass, queryName: queryName, querySName: querySName }), (() => {
                    if (qParams && query && result && models && !showNoRecordsAvailableContent && !showNoRecordsFoundContent) {
                        return this.cardOrTable();
                    }
                    else {
                        return (_jsx(View, { children: _jsx(Text, { children: this.t(".loading_dot_dot_dit", { defaultValue: "Loading..." }) }) }));
                    }
                })()] }));
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
        const flatList = (_jsx(TableContext.Provider, { value: this.tt.tableContextValue, children: _jsx(FlatList, { data: models, dataSet: {
                    class: classNames("api-maker--table", className),
                    cacheKey: this.s.tableSettingFullCacheKey,
                    lastUpdate: this.s.lastUpdate
                }, extraData: this.s.lastUpdate, keyExtractor: this.tt.keyExtrator, ListHeaderComponent: ListHeaderComponent, renderItem: this.tt.renderItem, showsHorizontalScrollIndicator: true, style: flatListStyle, ...restProps }) }));
        return (_jsxs(_Fragment, { children: [filterContent && filterCard &&
                    _jsx(Card, { className: "live-table--filter-card mb-4", children: this.filterForm() }), filterContent && !filterCard &&
                    this.filterForm(), card &&
                    _jsx(Card, { className: classNames("live-table--table-card", "mb-4", className), controls: this.tableControls(), header: headerContent, footer: this.tableFooter(), ...restProps, children: flatList }), !card && flatList, result && PaginationComponent &&
                    _jsx(PaginationComponent, { result: result }), result && paginateContent &&
                    paginateContent({ result })] }));
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
        return (_jsxs(Form, { className: "live-table--filter-form", formRef: filterFormRef, onSubmit: this.tt.onFilterFormSubmit, setForm: this.setStates.filterForm, children: ["s" in qParams &&
                    _jsx("input", { name: "s", type: "hidden", value: qParams.s }), filterContent({
                    onFilterChanged: submitFilter,
                    onFilterChangedWithDelay: submitFilterDebounce,
                    qParams,
                    queryQName
                }), filterSubmitButton &&
                    _jsx("input", { className: "btn btn-primary live-table--submit-filter-button", type: "submit", style: { marginTop: "8px" }, value: filterSubmitLabel || this.t(".filter", { defaultValue: "Filter" }) })] }));
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
            return (_jsx(View, { children: _jsx(Text, { children: this.t(".loading_dot_dot_dot", { defaultValue: "Loading..." }) }) }));
        }
        return (_jsx(ModelRow, { cacheKey: model.cacheKey(), columns: this.s.columnsToShow, columnWidths: this.columnWidths(), events: this.tt.events, index: index, model: model, table: this, tableSettingFullCacheKey: this.s.tableSettingFullCacheKey }, model.id()));
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
        return (_jsxs(View, { style: this.cache("tableControlsRootViewStyle", { flexDirection: "row" }), children: [controls && controls({ models, qParams, query, result }), _jsx(Pressable, { dataSet: { class: "filter-button" }, onPress: this.tt.onFilterClicked, children: _jsx(Icon, { name: "search", size: 20 }) }), _jsxs(View, { children: [showSettings &&
                            _jsx(Settings, { onRequestClose: this.tt.onRequestCloseSettings, table: this }), _jsx(Pressable, { dataSet: this.cache("settingsButtonDataSet", { class: "settings-button" }), onPress: this.tt.onSettingsClicked, children: _jsx(Icon, { name: "gear", size: 20 }) })] })] }));
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
        return (_jsxs(View, { style: this.cache("tableFooterRootViewStyle", { flexDirection: "row", justifyContent: "space-between", marginTop: 10 }), children: [_jsxs(View, { dataSet: this.cache("showingCountsDataSet", { class: "showing-counts" }), style: this.cache("showingCountsStyle", { flexDirection: "row" }), children: [_jsx(Text, { children: this.t(".showing_from_to_out_of_total", { defaultValue, from, to, total_count: totalCount }) }), this.p.workplace && this.s.currentWorkplaceCount !== null &&
                            _jsx(Text, { style: this.cache("xSelectedTextStyle", { marginLeft: 3 }), children: this.t(".x_selected", { defaultValue: "%{selected} selected.", selected: this.s.currentWorkplaceCount }) })] }), _jsx(View, { children: _jsx(Select, { className: "per-page-select", defaultValue: perPage, onChange: this.tt.onPerPageChanged, options: paginationOptions }) })] }));
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
        return (_jsx(DraggableSort, { data: this.s.columnsToShow, events: this.tt.draggableSortEvents, horizontal: true, keyExtractor: this.tt.dragListkeyExtractor, onItemMoved: this.tt.onItemMoved, onReordered: this.tt.onReordered, renderItem: this.tt.dragListRenderItemContent }));
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
        return (_jsx(HeaderColumn, { active: isActive, animatedWidth: animatedWidth, animatedZIndex: animatedZIndex, column: column, resizing: this.s.resizing, table: this, tableSettingColumn: tableSettingColumn, touchProps: touchProps, widths: this.s.widths }, tableSettingColumn.identifier()));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFibGUuanMiLCJzb3VyY2VSb290IjoiL3NyYy8iLCJzb3VyY2VzIjpbInRhYmxlL3RhYmxlLmpzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsT0FBTyxFQUFDLElBQUksRUFBRSxJQUFJLEVBQUMsTUFBTSxXQUFXLENBQUE7QUFDcEMsT0FBTyxLQUFLLEVBQUUsRUFBQyxhQUFhLEVBQUUsVUFBVSxFQUFFLE9BQU8sRUFBRSxNQUFNLEVBQUMsTUFBTSxPQUFPLENBQUE7QUFDdkUsT0FBTyxFQUFDLFFBQVEsRUFBRSxRQUFRLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBQyxNQUFNLGNBQWMsQ0FBQTtBQUNoRSxPQUFPLGFBQWEsTUFBTSxtQkFBbUIsQ0FBQTtBQUM3QyxPQUFPLElBQUksTUFBTSxtQkFBbUIsQ0FBQTtBQUNwQyxPQUFPLFVBQVUsTUFBTSxZQUFZLENBQUE7QUFDbkMsT0FBTyxVQUFVLE1BQU0sa0JBQWtCLENBQUE7QUFDekMsT0FBTyxhQUFhLE1BQU0scUJBQXFCLENBQUE7QUFDL0MsT0FBTyxRQUFRLE1BQU0sVUFBVSxDQUFBO0FBQy9CLE9BQU8sYUFBYSxNQUFNLHlCQUF5QixDQUFBO0FBQ25ELE9BQU8sRUFBQyxZQUFZLEVBQUMsTUFBTSxlQUFlLENBQUE7QUFDMUMsT0FBTyxPQUFPLE1BQU0saUJBQWlCLENBQUE7QUFDckMsT0FBTyxRQUFRLE1BQU0sd0JBQXdCLENBQUE7QUFDN0MsT0FBTyxFQUFDLElBQUksRUFBQyxNQUFNLFNBQVMsQ0FBQTtBQUM1QixPQUFPLE1BQU0sTUFBTSxxQkFBcUIsQ0FBQTtBQUN4QyxPQUFPLFlBQVksTUFBTSxpQkFBaUIsQ0FBQTtBQUMxQyxPQUFPLFlBQVksTUFBTSxpQkFBaUIsQ0FBQTtBQUMxQyxPQUFPLElBQUksTUFBTSxlQUFlLENBQUE7QUFDaEMsT0FBTyxFQUFDLFdBQVcsRUFBQyxNQUFNLGNBQWMsQ0FBQTtBQUN4QyxPQUFPLEtBQUssVUFBVSxNQUFNLFlBQVksQ0FBQTtBQUN4QyxPQUFP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YSxFQUFFLFNBQVMsQ0FBQyxDQUFBO1lBQ3pELE1BQU0saUJBQWlCLEdBQUcsTUFBTSxDQUFDLGFBQWEsQ0FBQyxVQUFVLENBQUMsQ0FBQTtZQUUxRCxXQUFXLENBQUMsT0FBTyxFQUFFLGlCQUFpQixDQUFDLENBQUE7UUFDekMsQ0FBQztRQUVELGtCQUFrQixDQUFDLFVBQVUsQ0FBQyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLENBQUE7UUFFeEQsTUFBTSxDQUFDLFlBQVksQ0FBQyxrQkFBa0IsRUFBRSxFQUFDLFVBQVUsRUFBQyxDQUFDLENBQUE7SUFDdkQsQ0FBQyxDQUFBO0lBRUQsb0JBQW9CLEdBQUcsUUFBUSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsWUFBWSxDQUFDLENBQUE7Q0FDdEQsQ0FBQyxDQUFDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge2RpZ2csIGRpZ3N9IGZyb20gXCJkaWdnZXJpemVcIlxuaW1wb3J0IFJlYWN0LCB7Y3JlYXRlQ29udGV4dCwgdXNlQ29udGV4dCwgdXNlTWVtbywgdXNlUmVmfSBmcm9tIFwicmVhY3RcIlxuaW1wb3J0IHtBbmltYXRlZCwgUGxhdGZvcm0sIFByZXNzYWJsZSwgVmlld30gZnJvbSBcInJlYWN0LW5hdGl2ZVwiXG5pbXBvcnQgQmFzZUNvbXBvbmVudCBmcm9tIFwiLi4vYmFzZS1jb21wb25lbnRcIlxuaW1wb3J0IENhcmQgZnJvbSBcIi4uL2Jvb3RzdHJhcC9jYXJkXCJcbmltcG9ydCBjbGFzc05hbWVzIGZyb20gXCJjbGFzc25hbWVzXCJcbmltcG9ydCBDb2xsZWN0aW9uIGZyb20gXCIuLi9jb2xsZWN0aW9uLmpzXCJcbmltcG9ydCBjb2x1bW5WaXNpYmxlIGZyb20gXCIuL2NvbHVtbi12aXNpYmxlLmpzXCJcbmltcG9ydCBkZWJvdW5jZSBmcm9tIFwiZGVib3VuY2VcIlxuaW1wb3J0IERyYWdnYWJsZVNvcnQgZnJvbSBcIi4uL2RyYWdnYWJsZS1zb3J0L2luZGV4XCJcbmltcG9ydCB7RXZlbnRFbWl0dGVyfSBmcm9tIFwiZXZlbnRlbWl0dGVyM1wiXG5pbXBvcnQgRmlsdGVycyBmcm9tIFwiLi9maWx0ZXJzL2luZGV4XCJcbmltcG9ydCBGbGF0TGlzdCBmcm9tIFwiLi9jb21wb25lbnRzL2ZsYXQtbGlzdFwiXG5pbXBvcnQge0Zvcm19IGZyb20gXCIuLi9mb3JtXCJcbmltcG9ydCBIZWFkZXIgZnJvbSBcIi4vY29tcG9uZW50cy9oZWFkZXJcIlxuaW1wb3J0IEhlYWRlckNvbHVtbiBmcm9tIFwiLi9oZWFkZXItY29sdW1uXCJcbmltcG9ydCBIZWFkZXJTZWxlY3QgZnJvbSBcIi4vaGVhZGVyLXNlbGVjdFwiXG5pbXBvcnQgSWNvbiBmcm9tIFwiLi4vdXRpbHMvaWNvblwiXG5pbXBvcnQge2luY29ycG9yYXRlfSBmcm9tIFwiaW5jb3Jwb3JhdG9yXCJcbmltcG9ydCAqIGFzIGluZmxlY3Rpb24gZnJvbSBcImluZmxlY3Rpb25cIlxuaW1wb3J0IG1lbW8gZnJvbSBcInNldC1zdGF0ZS1jb21wYXJlL2J1aWxkL21lbW8uanNcIlxuaW1wb3J0IG1vZGVsQ2xhc3NSZXF1aXJlIGZyb20gXCIuLi9tb2RlbC1jbGFzcy1yZXF1aXJlLmpzXCJcbmltcG9ydCBNb2RlbFJvdyBmcm9tIFwiLi9tb2RlbC1yb3dcIlxuaW1wb3J0IFBhZ2luYXRlIGZyb20gXCIuLi9ib290c3RyYXAvcGFnaW5hdGVcIlxuaW1wb3J0IFBhcmFtcyBmcm9tIFwiLi4vcGFyYW1zLmpzXCJcbmltcG9ydCBQcm9wVHlwZXMgZnJvbSBcInByb3AtdHlwZXNcIlxuaW1wb3J0IFJvdyBmcm9tIFwiLi9jb21wb25lbnRzL3Jvd1wiXG5pbXBvcnQgc2VsZWN0Q2FsY3VsYXRvciBmcm9tIFwiLi9zZWxlY3QtY2FsY3VsYXRvci5qc1wiXG5pbXBvcnQgU2VsZWN0IGZyb20gXCIuLi9pbnB1dHMvc2VsZWN0XCJcbmltcG9ydCBTZXR0aW5ncyBmcm9tIFwiLi9zZXR0aW5ncy9pbmRleFwiXG5pbXBvcnQge3NoYXBlQ29tcG9uZW50fSBmcm9tIFwic2V0LXN0YXRlLWNvbXBhcmUvYnVpbGQvc2hhcGUtY29tcG9uZW50LmpzXCJcbmltcG9ydCBUYWJsZVNldHRpbmdzIGZyb20gXCIuL3RhYmxlLXNldHRpbmdzLmpzXCJcbmltcG9ydCBUZXh0IGZyb20gXCIuLi91dGlscy90ZXh0XCJcbmltcG9ydCB1bmlxdW5pemUgZnJvbSBcInVuaXF1bml6ZVwiXG5pbXBvcnQgdXNlQnJlYWtwb2ludCBmcm9tIFwiLi4vdXNlLWJyZWFrcG9pbnQuanNcIlxuaW1wb3J0IHVzZUNvbGxlY3Rpb24gZnJvbSBcIi4uL3VzZS1jb2xsZWN0aW9uLmpzXCJcbmltcG9ydCB1c2VJMThuIGZyb20gXCJpMThuLW9uLXN0ZXJvaWRzL3NyYy91c2UtaTE4bi5tanNcIlxuaW1wb3J0IHVzZUV2ZW50RW1pdHRlciBmcm9tIFwiLi4vdXNlLWV2ZW50LWVtaXR0ZXIuanNcIlxuaW1wb3J0IHVzZU1vZGVsRXZlbnQgZnJvbSBcIi4uL3VzZS1tb2RlbC1ldmVudC5qc1wiXG5pbXBvcnQgdXNlUXVlcnlQYXJhbXMgZnJvbSBcIm9uLWxvY2F0aW9uLWNoYW5nZWQvYnVpbGQvdXNlLXF1ZXJ5LXBhcmFtcy5qc1wiXG5pbXBvcnQgV2lkdGhzIGZyb20gXCIuL3dpZHRoc1wiXG5pbXBvcnQgV29ya2VyUGx1Z2luc0NoZWNrQWxsQ2hlY2tib3ggZnJvbSBcIi4vd29ya2VyLXBsdWdpbnMtY2hlY2stYWxsLWNoZWNrYm94XCJcblxuY29uc3QgcGFnaW5hdGlvbk9wdGlvbnMgPSBbMzAsIDYwLCA5MCwgW1wiQWxsXCIsIFwiYWxsXCJdXVxuY29uc3QgVGFibGVDb250ZXh0ID0gY3JlYXRlQ29udGV4dCgpXG5cbmNvbnN0IExpc3RIZWFkZXJDb21wb25lbnQgPSBtZW1vKHNoYXBlQ29tcG9uZW50KGNsYXNzIExpc3RIZWFkZXJDb21wb25lbnQgZXh0ZW5kcyBCYXNlQ29tcG9uZW50IHtcbiAgc2V0dXAoKSB7XG4gICAgdGhpcy51c2VTdGF0ZXMoe1xuICAgICAgbGFzdFVwZGF0ZTogbmV3IERhdGUoKVxuICAgIH0pXG4gIH1cblxuICByZW5kZXIoKSB7XG4gICAgY29uc3Qge21kVXB9ID0gdXNlQnJlYWtwb2ludCgpXG4gICAgY29uc3QgdGFibGVDb250ZXh0VmFsdWUgPSB1c2VDb250ZXh0KFRhYmxlQ29udGV4dClcbiAgICBjb25zdCB0YWJsZSA9IHRhYmxlQ29udGV4dFZhbHVlLnRhYmxlXG4gICAgY29uc3Qge2NvbGxlY3Rpb24sIGV2ZW50cywgcXVlcnlXaXRob3V0UGFnaW5hdGlvbiwgdH0gPSB0YWJsZS50dFxuICAgIGNvbnN0IHtxdWVyeX0gPSBkaWdzKGNvbGxlY3Rpb24sIFwicXVlcnlcIilcblxuICAgIHVzZUV2ZW50RW1pdHRlcihldmVudHMsIFwiY29sdW1uVmlzaWJpbGl0eVVwZGF0ZWRcIiwgdGhpcy50dC5vbkNvbHVtblZpc2liaWxpdHlVcGRhdGVkKVxuXG4gICAgcmV0dXJuIChcbiAgICAgIDxSb3cgc3R5bGU9e3RhYmxlLnN0eWxlRm9yUm93SGVhZGVyKCl9IHRlc3RJRD1cImFwaS1tYWtlci90YWJsZS9oZWFkZXItcm93XCI+XG4gICAgICAgIHt0YWJsZS5wLndvcmtwbGFjZSAmJiB0YWJsZS5zLmN1cnJlbnRXb3JrcGxhY2UgJiZcbiAgICAgICAgICA8SGVhZGVyIHN0eWxlPXt0YWJsZS5zdHlsZUZvckhlYWRlcih7c3R5bGU6IHt3aWR0aDogbWRVcCA/IDQxIDogdW5kZWZpbmVkfX0pfT5cbiAgICAgICAgICAgIDxXb3JrZXJQbHVnaW5zQ2hlY2tBbGxDaGVja2JveFxuICAgICAgICAgICAgICBjdXJyZW50V29ya3BsYWNlPXt0YWJsZS5zLmN1cnJlbnRXb3JrcGxhY2V9XG4gICAgICAgICAgICAgIHF1ZXJ5PXtxdWVyeVdpdGhvdXRQYWdpbmF0aW9ufVxuICAgICAgICAgICAgICBzdHlsZT17dGhpcy5jYWNoZShcIndvcmtlclBsZ3VpbnNDaGVja0FsbENoZWNrYm94U3R5bGVcIiwge21hcmdpbkhvcml6b250YWw6IFwiYXV0b1wifSl9XG4gICAgICAgICAgICAvPlxuICAgICAgICAgICAgeyFtZFVwICYmXG4gICAgICAgICAgICAgIDxUZXh0IHN0eWxlPXt0aGlzLmNhY2hlKFwic2VsZWN0QWxsRm91bmRUZXh0U3R5bGVcIiwge21hcmdpbkxlZnQ6IDN9KX0+XG4gICAgICAgICAgICAgICAge3QoXCIuc2VsZWN0X2FsbF9mb3VuZFwiLCB7ZGVmYXVsdFZhbHVlOiBcIlNlbGVjdCBhbGwgZm91bmRcIn0pfVxuICAgICAgICAgICAgICA8L1RleHQ+XG4gICAgICAgICAgICB9XG4gICAgICAgICAgPC9IZWFkZXI+XG4gICAgICAgIH1cbiAgICAgICAgeyFtZFVwICYmXG4gICAgICAgICAgPEhlYWRlciBzdHlsZT17dGFibGUuc3R5bGVGb3JIZWFkZXIoe3N0eWxlOiB7fX0pfT5cbiAgICAgICAgICAgIDxIZWFkZXJTZWxlY3QgcHJlcGFyZWRDb2x1bW5zPXt0YWJsZS5zLnByZXBhcmVkQ29sdW1uc30gcXVlcnk9e3F1ZXJ5fSB0YWJsZT17dGFibGV9IC8+XG4gICAgICAgICAgPC9IZWFkZXI+XG4gICAgICAgIH1cbiAgICAgICAge21kVXAgJiZcbiAgICAgICAgICA8PlxuICAgICAgICAgICAge3RhYmxlLmhlYWRlcnNDb250ZW50RnJvbUNvbHVtbnMoKX1cbiAgICAgICAgICAgIDxIZWFkZXIgc3R5bGU9e3RhYmxlLnN0eWxlRm9ySGVhZGVyKHtzdHlsZToge30sIHR5cGU6IFwiYWN0aW9uc1wifSl9IC8+XG4gICAgICAgICAgPC8+XG4gICAgICAgIH1cbiAgICAgIDwvUm93PlxuICAgIClcbiAgfVxuXG4gIG9uQ29sdW1uVmlzaWJpbGl0eVVwZGF0ZWQgPSAoKSA9PiB0aGlzLnNldFN0YXRlKHtsYXN0VXBkYXRlOiBuZXcgRGF0ZSgpfSlcbn0pKVxuXG5leHBvcnQgZGVmYXVsdCBtZW1vKHNoYXBlQ29tcG9uZW50KGNsYXNzIEFwaU1ha2VyVGFibGUgZXh0ZW5kcyBCYXNlQ29tcG9uZW50IHtcbiAgc3RhdGljIGRlZmF1bHRQcm9wcyA9IHtcbiAgICBjYXJkOiB0cnVlLFxuICAgIGN1cnJlbnRVc2VyOiBudWxsLFxuICAgIGRlc3Ryb3lFbmFibGVkOiB0cnVlLFxuICAgIGZpbHRlckNhcmQ6IHRydWUsXG4gICAgZmlsdGVyU3VibWl0QnV0dG9uOiB0cnVlLFxuICAgIG5vUmVjb3Jkc0F2YWlsYWJsZUNvbnRlbnQ6IHVuZGVmaW5lZCxcbiAgICBub1JlY29yZHNGb3VuZENvbnRlbnQ6IHVuZGVmaW5lZCxcbiAgICBwcmVsb2FkczogW10sXG4gICAgc2VsZWN0OiB7fSxcbiAgICBzdHlsZVVJOiB0cnVlLFxuICAgIHdvcmtwbGFjZTogZmFsc2VcbiAgfVxuXG4gIHN0YXRpYyBwcm9wVHlwZXMgPSB7XG4gICAgYWJpbGl0aWVzOiBQcm9wVHlwZXMub2JqZWN0LFxuICAgIGFjdGlvbnNDb250ZW50OiBQcm9wVHlwZXMuZnVuYyxcbiAgICBhcHBIaXN0b3J5OiBQcm9wVHlwZXMub2JqZWN0LFxuICAgIGNhcmQ6IFByb3BUeXBlcy5ib29sLmlzUmVxdWlyZWQsXG4gICAgY2xhc3NOYW1lOiBQcm9wVHlwZXMuc3RyaW5nLFxuICAgIGNvbGxlY3Rpb246IFByb3BUeXBlcy5pbnN0YW5jZU9mKENvbGxlY3Rpb24pLFxuICAgIGNvbHVtbnM6IFByb3BUeXBlcy5vbmVPZlR5cGUoW1Byb3BUeXBlcy5hcnJheSwgUHJvcFR5cGVzLmZ1bmNdKSxcbiAgICBjb250cm9sczogUHJvcFR5cGVzLmZ1bmMsXG4gICAgY3VycmVudFVzZXI6IFByb3BUeXBlcy5vYmplY3QsXG4gICAgZGVmYXVsdERhdGVGb3JtYXROYW1lOiBQcm9wVHlwZXMuc3RyaW5nLFxuICAgIGRlZmF1bHREYXRlVGltZUZvcm1hdE5hbWU6IFByb3BUeXBlcy5zdHJpbmcsXG4gICAgZGVmYXVsdFBhcmFtczogUHJvcFR5cGVzLm9iamVjdCxcbiAgICBkZXN0cm95RW5hYmxlZDogUHJvcFR5cGVzLmJvb2wuaXNSZXF1aXJlZCxcbiAgICBkZXN0cm95TWVzc2FnZTogUHJvcFR5cGVzLnN0cmluZyxcbiAgICBlZGl0TW9kZWxQYXRoOiBQcm9wVHlwZXMuZnVuYyxcbiAgICBmaWx0ZXJDYXJkOiBQcm9wVHlwZXMuYm9vbC5pc1JlcXVpcmVkLFxuICAgIGZpbHRlckNvbnRlbnQ6IFByb3BUeXBlcy5mdW5jLFxuICAgIGZpbHRlclN1Ym1pdExhYmVsOiBQcm9wVHlwZXMuYW55LFxuICAgIGdyb3VwQnk6IFByb3BUeXBlcy5hcnJheSxcbiAgICBoZWFkZXI6IFByb3BUeXBlcy5vbmVPZlR5cGUoW1Byb3BUeXBlcy5mdW5jLCBQcm9wVHlwZXMuc3RyaW5nXSksXG4gICAgaWRlbnRpZmllcjogUHJvcFR5cGVzLnN0cmluZyxcbiAgICBtb2RlbENsYXNzOiBQcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuICAgIG5vUmVjb3Jkc0F2YWlsYWJsZUNvbnRlbnQ6IFByb3BUeXBlcy5mdW5jLFxuICAgIG5vUmVjb3Jkc0ZvdW5kQ29udGVudDogUHJvcFR5cGVzLmZ1bmMsXG4gICAgb25Nb2RlbHNMb2FkZWQ6IFByb3BUeXBlcy5mdW5jLFxuICAgIHBhZ2luYXRlQ29udGVudDogUHJvcFR5cGVzLmZ1bmMsXG4gICAgcGFnaW5hdGlvbkNvbXBvbmVudDogUHJvcFR5cGVzLmZ1bmMsXG4gICAgcHJlbG9hZHM6IFByb3BUeXBlcy5hcnJheS5pc1JlcXVpcmVkLFxuICAgIHF1ZXJ5TWV0aG9kOiBQcm9wVHlwZXMuZnVuYyxcbiAgICBxdWVyeU5hbWU6IFByb3BUeXBlcy5zdHJpbmcsXG4gICAgc2VsZWN0OiBQcm9wVHlwZXMub2JqZWN0LFxuICAgIHNlbGVjdENvbHVtbnM6IFByb3BUeXBlcy5vYmplY3QsXG4gICAgc3R5bGVzOiBQcm9wVHlwZXMub2JqZWN0LFxuICAgIHN0eWxlVUk6IFByb3BUeXBlcy5ib29sLmlzUmVxdWlyZWQsXG4gICAgdmlld01vZGVsUGF0aDogUHJvcFR5cGVzLmZ1bmMsXG4gICAgd29ya3BsYWNlOiBQcm9wVHlwZXMuYm9vbC5pc1JlcXVpcmVkXG4gIH1cblxuICBkcmFnZ2FibGVTb3J0RXZlbnRzID0gbmV3IEV2ZW50RW1pdHRlcigpXG4gIGV2ZW50cyA9IG5ldyBFdmVudEVtaXR0ZXIoKVxuICB0YWJsZVNldHRpbmdzID0gbnVsbFxuXG4gIHNldHVwKCkge1xuICAgIGNvbnN0IHt0fSA9IHVzZUkxOG4oe25hbWVzcGFjZTogXCJqcy5hcGlfbWFrZXIudGFibGVcIn0pXG4gICAgY29uc3Qge25hbWU6IGJyZWFrcG9pbnQsIG1kVXB9ID0gdXNlQnJlYWtwb2ludCgpXG4gICAgY29uc3QgcXVlcnlQYXJhbXMgPSB1c2VRdWVyeVBhcmFtcygpXG5cbiAgICB0aGlzLnNldEluc3RhbmNlKHtcbiAgICAgIGJyZWFrcG9pbnQsXG4gICAgICBmaWx0ZXJGb3JtUmVmOiB1c2VSZWYoKSxcbiAgICAgIG1kVXAsXG4gICAgICB0XG4gICAgfSlcblxuICAgIGNvbnN0IGNvbGxlY3Rpb25LZXkgPSBkaWdnKHRoaXMucC5tb2RlbENsYXNzLm1vZGVsQ2xhc3NEYXRhKCksIFwiY29sbGVjdGlvbktleVwiKVxuICAgIGxldCBxdWVyeU5hbWUgPSB0aGlzLnByb3BzLnF1ZXJ5TmFtZVxuXG4gICAgaWYgKCFxdWVyeU5hbWUpIHF1ZXJ5TmFtZSA9IGNvbGxlY3Rpb25LZXlcblxuICAgIGNvbnN0IHF1ZXJ5U05hbWUgPSBgJHtxdWVyeU5hbWV9X3NgXG5cbiAgICB0aGlzLnVzZVN0YXRlcyh7XG4gICAgICBjb2x1bW5zOiAoKSA9PiB0aGlzLmNvbHVtbnNBc0FycmF5KCksXG4gICAgICBjdXJyZW50V29ya3BsYWNlOiB1bmRlZmluZWQsXG4gICAgICBjdXJyZW50V29ya3BsYWNlQ291bnQ6IG51bGwsXG4gICAgICBmaWx0ZXJGb3JtOiBudWxsLFxuICAgICAgY29sdW1uc1RvU2hvdzogbnVsbCxcbiAgICAgIGRyYWdnZWRDb2x1bW46IG51bGwsXG4gICAgICBpZGVudGlmaWVyOiAoKSA9PiB0aGlzLnByb3BzLmlkZW50aWZpZXIgfHwgYCR7Y29sbGVjdGlvbktleX0tZGVmYXVsdGAsXG4gICAgICBsYXN0VXBkYXRlOiAoKSA9PiBuZXcgRGF0ZSgpLFxuICAgICAgcHJlbG9hZDogdW5kZWZpbmVkLFxuICAgICAgcHJlcGFyZWRDb2x1bW5zOiB1bmRlZmluZWQsXG4gICAgICBxdWVyeU5hbWUsXG4gICAgICBxdWVyeVFOYW1lOiAoKSA9PiBgJHtxdWVyeU5hbWV9X3FgLFxuICAgICAgcXVlcnlQYWdlTmFtZTogKCkgPT4gYCR7cXVlcnlOYW1lfV9wYWdlYCxcbiAgICAgIHF1ZXJ5U05hbWUsXG4gICAgICByZXNpemluZzogZmFsc2UsXG4gICAgICBzaG93RmlsdGVyczogKCkgPT4gQm9vbGVhbihxdWVyeVBhcmFtc1txdWVyeVNOYW1lXSksXG4gICAgICBzaG93U2V0dGluZ3M6IGZhbHNlLFxuICAgICAgdGFibGVTZXR0aW5nOiB1bmRlZmluZWQsXG4gICAgICB0YWJsZVNldHRpbmdMb2FkZWQ6IGZhbHNlLFxuICAgICAgdGFibGVTZXR0aW5nRnVsbENhY2hlS2V5OiB1bmRlZmluZWQsXG4gICAgICB3aWR0aDogdW5kZWZpbmVkLFxuICAgICAgd2lkdGhzOiBudWxsXG4gICAgfSlcblxuICAgIHRoaXMudGFibGVDb250ZXh0VmFsdWUgPSB1c2VNZW1vKFxuICAgICAgKCkgPT4gKHtcbiAgICAgICAgY2FjaGVLZXk6IHRoaXMucy50YWJsZVNldHRpbmdGdWxsQ2FjaGVLZXksXG4gICAgICAgIGxhc3RVcGRhdGU6IHRoaXMucy5sYXN0VXBkYXRlLFxuICAgICAgICByZXNpemluZzogdGhpcy5zLnJlc2l6aW5nLFxuICAgICAgICB0YWJsZTogdGhpc1xuICAgICAgfSksXG4gICAgICBbdGhpcy5zLmxhc3RVcGRhdGUsIHRoaXMucy5yZXNpemluZywgdGhpcy5zLnRhYmxlU2V0dGluZ0Z1bGxDYWNoZUtleV1cbiAgICApXG5cbiAgICB1c2VNZW1vKCgpID0+IHtcbiAgICAgIGlmICh0aGlzLnByb3BzLndvcmtwbGFjZSkge1xuICAgICAgICB0aGlzLmxvYWRDdXJyZW50V29ya3BsYWNlKCkudGhlbigoKSA9PiB7XG4gICAgICAgICAgdGhpcy5sb2FkQ3VycmVudFdvcmtwbGFjZUNvdW50KClcbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICB9LCBbdGhpcy5wLmN1cnJlbnRVc2VyPy5pZCgpXSlcblxuICAgIHVzZU1lbW8oKCkgPT4ge1xuICAgICAgaWYgKCF0aGlzLnR0LnRhYmxlU2V0dGluZ3MgJiYgdGhpcy5zLndpZHRoKSB7XG4gICAgICAgIHRoaXMubG9hZFRhYmxlU2V0dGluZygpXG4gICAgICB9XG4gICAgfSwgW3RoaXMucC5jdXJyZW50VXNlcj8uaWQoKSwgdGhpcy5zLndpZHRoXSlcblxuICAgIHVzZU1vZGVsRXZlbnQodGhpcy5zLmN1cnJlbnRXb3JrcGxhY2UsIFwid29ya3BsYWNlX2xpbmtzX2NyZWF0ZWRcIiwgdGhpcy50dC5vbkxpbmtzQ3JlYXRlZClcbiAgICB1c2VNb2RlbEV2ZW50KHRoaXMucy5jdXJyZW50V29ya3BsYWNlLCBcIndvcmtwbGFjZV9saW5rc19kZXN0cm95ZWRcIiwgdGhpcy50dC5vbkxpbmtzRGVzdHJveWVkKVxuXG4gICAgbGV0IGNvbGxlY3Rpb25SZWFkeSA9IHRydWVcbiAgICBsZXQgc2VsZWN0XG5cbiAgICBpZiAoIXRoaXMucy5wcmVwYXJlZENvbHVtbnMpIHtcbiAgICAgIGNvbGxlY3Rpb25SZWFkeSA9IGZhbHNlXG4gICAgfVxuXG4gICAgaWYgKGNvbGxlY3Rpb25SZWFkeSkge1xuICAgICAgc2VsZWN0ID0gc2VsZWN0Q2FsY3VsYXRvcih7dGFibGU6IHRoaXN9KVxuICAgIH1cblxuICAgIHRoaXMuY29sbGVjdGlvbiA9IHVzZUNvbGxlY3Rpb24oe1xuICAgICAgYWJpbGl0aWVzOiB0aGlzLmFiaWxpdGllc1RvTG9hZCgpLFxuICAgICAgZGVmYXVsdFBhcmFtczogdGhpcy5wcm9wcy5kZWZhdWx0UGFyYW1zLFxuICAgICAgY29sbGVjdGlvbjogdGhpcy5wcm9wcy5jb2xsZWN0aW9uLFxuICAgICAgZ3JvdXBCeTogdGhpcy5wcm9wcy5ncm91cEJ5LFxuICAgICAgaWZDb25kaXRpb246IGNvbGxlY3Rpb25SZWFkeSxcbiAgICAgIG1vZGVsQ2xhc3M6IHRoaXMucHJvcHMubW9kZWxDbGFzcyxcbiAgICAgIG9uTW9kZWxzTG9hZGVkOiB0aGlzLnByb3BzLm9uTW9kZWxzTG9hZGVkLFxuICAgICAgbm9SZWNvcmRzQXZhaWxhYmxlQ29udGVudDogdGhpcy5wcm9wcy5ub1JlY29yZHNBdmFpbGFibGVDb250ZW50LFxuICAgICAgbm9SZWNvcmRzRm91bmRDb250ZW50OiB0aGlzLnByb3BzLm5vUmVjb3Jkc0ZvdW5kQ29udGVudCxcbiAgICAgIHBhZ2luYXRpb246IHRydWUsXG4gICAgICBwcmVsb2FkczogdGhpcy5zdGF0ZS5wcmVsb2FkLFxuICAgICAgcXVlcnlNZXRob2Q6IHRoaXMucHJvcHMucXVlcnlNZXRob2QsXG4gICAgICBxdWVyeU5hbWUsXG4gICAgICBzZWxlY3QsXG4gICAgICBzZWxlY3RDb2x1bW5zOiB0aGlzLnByb3BzLnNlbGVjdENvbHVtbnNcbiAgICB9KVxuICAgIHRoaXMucXVlcnlXaXRob3V0UGFnaW5hdGlvbiA9IHVzZU1lbW8oXG4gICAgICAoKSA9PiB0aGlzLmNvbGxlY3Rpb24/LnF1ZXJ5Py5jbG9uZSgpPy5leGNlcHQoXCJwYWdlXCIpLFxuICAgICAgW3RoaXMuY29sbGVjdGlvbi5xdWVyeV1cbiAgICApXG5cbiAgICB1c2VFdmVudEVtaXR0ZXIodGhpcy50dC5kcmFnZ2FibGVTb3J0RXZlbnRzLCBcIm9uRHJhZ1N0YXJ0XCIsIHRoaXMudHQub25EcmFnU3RhcnQpXG4gICAgdXNlRXZlbnRFbWl0dGVyKHRoaXMudHQuZHJhZ2dhYmxlU29ydEV2ZW50cywgXCJvbkRyYWdFbmRBbmltYXRpb25cIiwgdGhpcy50dC5vbkRyYWdFbmRBbmltYXRpb24pXG4gICAgdXNlRXZlbnRFbWl0dGVyKHRoaXMudHQuZXZlbnRzLCBcImNvbHVtblZpc2liaWxpdHlVcGRhdGVkXCIsIHRoaXMudHQub25Db2x1bW5WaXNpYmlsaXR5VXBkYXRlZClcbiAgfVxuXG4gIG9uQ29sdW1uVmlzaWJpbGl0eVVwZGF0ZWQgPSAoKSA9PiB0aGlzLnNldFN0YXRlKHtjb2x1bW5zVG9TaG93OiB0aGlzLmdldENvbHVtbnNUb1Nob3codGhpcy5zLmNvbHVtbnMpLCBsYXN0VXBkYXRlOiBuZXcgRGF0ZSgpfSlcbiAgb25EcmFnU3RhcnQgPSAoe2l0ZW19KSA9PiBpdGVtLmFuaW1hdGVkWkluZGV4LnNldFZhbHVlKDk5OTkpXG4gIG9uRHJhZ0VuZEFuaW1hdGlvbiA9ICh7aXRlbX0pID0+IGl0ZW0uYW5pbWF0ZWRaSW5kZXguc2V0VmFsdWUoMClcblxuICBhc3luYyBsb2FkQ3VycmVudFdvcmtwbGFjZSgpIHtcbiAgICBjb25zdCBXb3JrcGxhY2UgPSBtb2RlbENsYXNzUmVxdWlyZShcIldvcmtwbGFjZVwiKVxuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IFdvcmtwbGFjZS5jdXJyZW50KClcbiAgICBjb25zdCBjdXJyZW50V29ya3BsYWNlID0gZGlnZyhyZXN1bHQsIFwiY3VycmVudFwiLCAwKVxuXG4gICAgdGhpcy5zZXRTdGF0ZSh7Y3VycmVudFdvcmtwbGFjZX0pXG4gIH1cblxuICBhc3luYyBsb2FkQ3VycmVudFdvcmtwbGFjZUNvdW50KCkge1xuICAgIGNvbnN0IFdvcmtwbGFjZUxpbmsgPSBtb2RlbENsYXNzUmVxdWlyZShcIldvcmtwbGFjZUxpbmtcIilcbiAgICBjb25zdCBjdXJyZW50V29ya3BsYWNlQ291bnQgPSBhd2FpdCBXb3JrcGxhY2VMaW5rXG4gICAgICAucmFuc2Fjayh7XG4gICAgICAgIHJlc291cmNlX3R5cGVfZXE6IHRoaXMucC5tb2RlbENsYXNzLm1vZGVsQ2xhc3NEYXRhKCkubmFtZSxcbiAgICAgICAgd29ya3BsYWNlX2lkX2VxOiB0aGlzLnMuY3VycmVudFdvcmtwbGFjZS5pZCgpXG4gICAgICB9KVxuICAgICAgLmNvdW50KClcblxuICAgIHRoaXMuc2V0U3RhdGUoe2N1cnJlbnRXb3JrcGxhY2VDb3VudH0pXG4gIH1cblxuICBnZXRDb2x1bW5zVG9TaG93KGNvbHVtbnMpIHtcbiAgICByZXR1cm4gY29sdW1uc1xuICAgICAgLmZpbHRlcigoe2NvbHVtbiwgdGFibGVTZXR0aW5nQ29sdW1ufSkgPT4gY29sdW1uVmlzaWJsZShjb2x1bW4sIHRhYmxlU2V0dGluZ0NvbHVtbikpXG4gICAgICAuc29ydCgoYSwgYikgPT4gYS50YWJsZVNldHRpbmdDb2x1bW4ucG9zaXRpb24oKSAtIGIudGFibGVTZXR0aW5nQ29sdW1uLnBvc2l0aW9uKCkpXG4gIH1cblxuICBhc3luYyBsb2FkVGFibGVTZXR0aW5nKCkge1xuICAgIHRoaXMudGFibGVTZXR0aW5ncyA9IG5ldyBUYWJsZVNldHRpbmdzKHt0YWJsZTogdGhpc30pXG5cbiAgICBjb25zdCB0YWJsZVNldHRpbmcgPSBhd2FpdCB0aGlzLnRhYmxlU2V0dGluZ3MubG9hZEV4aXN0aW5nT3JDcmVhdGVUYWJsZVNldHRpbmdzKClcbiAgICBjb25zdCB7Y29sdW1ucywgcHJlbG9hZH0gPSB0aGlzLnRhYmxlU2V0dGluZ3MucHJlcGFyZWRDb2x1bW5zKHRhYmxlU2V0dGluZylcbiAgICBjb25zdCB7d2lkdGh9ID0gdGhpcy5zXG4gICAgY29uc3Qgd2lkdGhzID0gbmV3IFdpZHRocyh7Y29sdW1ucywgdGFibGU6IHRoaXMsIHdpZHRofSlcbiAgICBjb25zdCBjb2x1bW5zVG9TaG93ID0gdGhpcy5nZXRDb2x1bW5zVG9TaG93KGNvbHVtbnMpXG5cbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIGNvbHVtbnMsXG4gICAgICBjb2x1bW5zVG9TaG93LFxuICAgICAgcHJlcGFyZWRDb2x1bW5zOiBjb2x1bW5zLFxuICAgICAgcHJlbG9hZDogdGhpcy5tZXJnZWRQcmVsb2FkcyhwcmVsb2FkKSxcbiAgICAgIHRhYmxlU2V0dGluZyxcbiAgICAgIHRhYmxlU2V0dGluZ0xvYWRlZDogdHJ1ZSxcbiAgICAgIHRhYmxlU2V0dGluZ0Z1bGxDYWNoZUtleTogdGFibGVTZXR0aW5nLmZ1bGxDYWNoZUtleSgpLFxuICAgICAgd2lkdGhzXG4gICAgfSlcbiAgfVxuXG4gIHVwZGF0ZVNldHRpbmdzRnVsbENhY2hlS2V5ID0gKCkgPT4gdGhpcy5zZXRTdGF0ZSh7dGFibGVTZXR0aW5nRnVsbENhY2hlS2V5OiB0aGlzLnN0YXRlLnRhYmxlU2V0dGluZy5mdWxsQ2FjaGVLZXkoKX0pXG5cbiAgY29sdW1uc0FzQXJyYXkgPSAoKSA9PiB7XG4gICAgaWYgKHR5cGVvZiB0aGlzLnByb3BzLmNvbHVtbnMgPT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICByZXR1cm4gdGhpcy5wcm9wcy5jb2x1bW5zKClcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5wcm9wcy5jb2x1bW5zXG4gIH1cblxuICBtZXJnZWRQcmVsb2FkcyhwcmVsb2FkKSB7XG4gICAgY29uc3Qge3ByZWxvYWRzfSA9IHRoaXMucHJvcHNcbiAgICBsZXQgbWVyZ2VkUHJlbG9hZHMgPSBbXVxuXG4gICAgaWYgKHByZWxvYWRzKSBtZXJnZWRQcmVsb2FkcyA9IG1lcmdlZFByZWxvYWRzLmNvbmNhdChwcmVsb2FkcylcbiAgICBpZiAocHJlbG9hZCkgbWVyZ2VkUHJlbG9hZHMgPSBtZXJnZWRQcmVsb2Fkcy5jb25jYXQocHJlbG9hZClcblxuICAgIHJldHVybiB1bmlxdW5pemUobWVyZ2VkUHJlbG9hZHMpXG4gIH1cblxuICByZW5kZXIgKCkge1xuICAgIGNvbnN0IHttb2RlbENsYXNzLCBub1JlY29yZHNBdmFpbGFibGVDb250ZW50LCBub1JlY29yZHNGb3VuZENvbnRlbnR9ID0gdGhpcy5wXG4gICAgY29uc3Qge2NvbGxlY3Rpb24sIGN1cnJlbnRVc2VyfSA9IHRoaXMucHJvcHNcbiAgICBjb25zdCB7cXVlcnlOYW1lLCBxdWVyeVNOYW1lLCBzaG93RmlsdGVyc30gPSB0aGlzLnNcbiAgICBjb25zdCB7XG4gICAgICBtb2RlbHMsXG4gICAgICBvdmVyYWxsQ291bnQsXG4gICAgICBxUGFyYW1zLFxuICAgICAgcXVlcnksXG4gICAgICByZXN1bHQsXG4gICAgICBzaG93Tm9SZWNvcmRzQXZhaWxhYmxlQ29udGVudCxcbiAgICAgIHNob3dOb1JlY29yZHNGb3VuZENvbnRlbnRcbiAgICB9ID0gZGlncyhcbiAgICAgIHRoaXMuY29sbGVjdGlvbixcbiAgICAgIFwibW9kZWxzXCIsXG4gICAgICBcIm92ZXJhbGxDb3VudFwiLFxuICAgICAgXCJxUGFyYW1zXCIsXG4gICAgICBcInF1ZXJ5XCIsXG4gICAgICBcInJlc3VsdFwiLFxuICAgICAgXCJzaG93Tm9SZWNvcmRzQXZhaWxhYmxlQ29udGVudFwiLFxuICAgICAgXCJzaG93Tm9SZWNvcmRzRm91bmRDb250ZW50XCJcbiAgICApXG5cbiAgICBpZiAoY29sbGVjdGlvbiAmJiBjb2xsZWN0aW9uLmFyZ3MubW9kZWxDbGFzcy5tb2RlbENsYXNzRGF0YSgpLm5hbWUgIT0gbW9kZWxDbGFzcy5tb2RlbENsYXNzRGF0YSgpLm5hbWUpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgYE1vZGVsIGNsYXNzIGZyb20gY29sbGVjdGlvbiAnJHtjb2xsZWN0aW9uLmFyZ3MubW9kZWxDbGFzcy5tb2RlbENsYXNzRGF0YSgpLm5hbWV9JyBgICtcbiAgICAgICAgYGRpZG4ndCBtYXRjaCBtb2RlbCBjbGFzcyBvbiB0YWJsZTogJyR7bW9kZWxDbGFzcy5tb2RlbENsYXNzRGF0YSgpLm5hbWV9J2BcbiAgICAgIClcbiAgICB9XG5cbiAgICByZXR1cm4gKFxuICAgICAgPFZpZXdcbiAgICAgICAgZGF0YVNldD17dGhpcy5jYWNoZShcInJvb3RWaWV3RGF0YVNldFwiLCB7Y2xhc3M6IHRoaXMuY2xhc3NOYW1lKCl9LCBbdGhpcy5jbGFzc05hbWUoKV0pfVxuICAgICAgICBvbkxheW91dD17dGhpcy50dC5vbkNvbnRhaW5lckxheW91dH1cbiAgICAgICAgc3R5bGU9e3RoaXMucHJvcHMuc3R5bGVzPy5jb250YWluZXJ9XG4gICAgICA+XG4gICAgICAgIHtzaG93Tm9SZWNvcmRzQXZhaWxhYmxlQ29udGVudCAmJlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibGl2ZS10YWJsZS0tbm8tcmVjb3Jkcy1hdmFpbGFibGUtY29udGVudFwiPlxuICAgICAgICAgICAge25vUmVjb3Jkc0F2YWlsYWJsZUNvbnRlbnQoe21vZGVscywgcVBhcmFtcywgb3ZlcmFsbENvdW50fSl9XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIH1cbiAgICAgICAge3Nob3dOb1JlY29yZHNGb3VuZENvbnRlbnQgJiZcbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImxpdmUtdGFibGUtLW5vLXJlY29yZHMtZm91bmQtY29udGVudFwiPlxuICAgICAgICAgICAge25vUmVjb3Jkc0ZvdW5kQ29udGVudCh7bW9kZWxzLCBxUGFyYW1zLCBvdmVyYWxsQ291bnR9KX1cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgfVxuICAgICAgICB7c2hvd0ZpbHRlcnMgJiZcbiAgICAgICAgICA8RmlsdGVycyBjdXJyZW50VXNlcj17Y3VycmVudFVzZXJ9IG1vZGVsQ2xhc3M9e21vZGVsQ2xhc3N9IHF1ZXJ5TmFtZT17cXVlcnlOYW1lfSBxdWVyeVNOYW1lPXtxdWVyeVNOYW1lfSAvPlxuICAgICAgICB9XG4gICAgICAgIHsoKCkgPT4ge1xuICAgICAgICAgIGlmIChxUGFyYW1zICYmIHF1ZXJ5ICYmIHJlc3VsdCAmJiBtb2RlbHMgJiYgIXNob3dOb1JlY29yZHNBdmFpbGFibGVDb250ZW50ICYmICFzaG93Tm9SZWNvcmRzRm91bmRDb250ZW50KSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jYXJkT3JUYWJsZSgpXG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgIDxWaWV3PlxuICAgICAgICAgICAgICAgIDxUZXh0Pnt0aGlzLnQoXCIubG9hZGluZ19kb3RfZG90X2RpdFwiLCB7ZGVmYXVsdFZhbHVlOiBcIkxvYWRpbmcuLi5cIn0pfTwvVGV4dD5cbiAgICAgICAgICAgICAgPC9WaWV3PlxuICAgICAgICAgICAgKVxuICAgICAgICAgIH1cbiAgICAgICAgfSkoKX1cbiAgICAgIDwvVmlldz5cbiAgICApXG4gIH1cblxuICBhYmlsaXRpZXNUb0xvYWQgKCkge1xuICAgIGNvbnN0IGFiaWxpdGllc1RvTG9hZCA9IHt9XG4gICAgY29uc3Qge2FiaWxpdGllcywgbW9kZWxDbGFzc30gPSB0aGlzLnByb3BzXG4gICAgY29uc3Qgb3duQWJpbGl0aWVzID0gW11cblxuICAgIGlmICh0aGlzLnByb3BzLmRlc3Ryb3lFbmFibGVkKSBvd25BYmlsaXRpZXMucHVzaChcImRlc3Ryb3lcIilcbiAgICBpZiAodGhpcy5wcm9wcy5lZGl0TW9kZWxQYXRoKSBvd25BYmlsaXRpZXMucHVzaChcImVkaXRcIilcbiAgICBpZiAodGhpcy5wcm9wcy52aWV3TW9kZWxQYXRoKSBvd25BYmlsaXRpZXMucHVzaChcInNob3dcIilcblxuICAgIGlmIChvd25BYmlsaXRpZXMubGVuZ3RoID4gMCkge1xuICAgICAgY29uc3QgbW9kZWxDbGFzc05hbWUgPSBkaWdnKG1vZGVsQ2xhc3MubW9kZWxDbGFzc0RhdGEoKSwgXCJuYW1lXCIpXG5cbiAgICAgIGFiaWxpdGllc1RvTG9hZFttb2RlbENsYXNzTmFtZV0gPSBvd25BYmlsaXRpZXNcbiAgICB9XG5cbiAgICBpZiAoYWJpbGl0aWVzKSB7XG4gICAgICBmb3IgKGNvbnN0IG1vZGVsTmFtZSBpbiBhYmlsaXRpZXMpIHtcbiAgICAgICAgaWYgKCEobW9kZWxOYW1lIGluIGFiaWxpdGllc1RvTG9hZCkpIHtcbiAgICAgICAgICBhYmlsaXRpZXNUb0xvYWRbbW9kZWxOYW1lXSA9IFtdXG4gICAgICAgIH1cblxuICAgICAgICBmb3IgKGNvbnN0IGFiaWxpdHkgb2YgYWJpbGl0aWVzW21vZGVsTmFtZV0pIHtcbiAgICAgICAgICBhYmlsaXRpZXNUb0xvYWRbbW9kZWxOYW1lXS5wdXNoKGFiaWxpdHkpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gYWJpbGl0aWVzVG9Mb2FkXG4gIH1cblxuICBjYXJkT3JUYWJsZSAoKSB7XG4gICAgY29uc3Qge1xuICAgICAgYWJpbGl0aWVzLFxuICAgICAgYWN0aW9uc0NvbnRlbnQsXG4gICAgICBhcHBIaXN0b3J5LFxuICAgICAgY2FyZCxcbiAgICAgIGNsYXNzTmFtZSxcbiAgICAgIGNvbGxlY3Rpb24sXG4gICAgICBjb2x1bW5zLFxuICAgICAgY29udHJvbHMsXG4gICAgICBjdXJyZW50VXNlcixcbiAgICAgIGRlZmF1bHREYXRlRm9ybWF0TmFtZSxcbiAgICAgIGRlZmF1bHREYXRlVGltZUZvcm1hdE5hbWUsXG4gICAgICBkZWZhdWx0UGFyYW1zLFxuICAgICAgZGVzdHJveUVuYWJsZWQsXG4gICAgICBkZXN0cm95TWVzc2FnZSxcbiAgICAgIGVkaXRNb2RlbFBhdGgsXG4gICAgICBmaWx0ZXJDYXJkLFxuICAgICAgZmlsdGVyQ29udGVudCxcbiAgICAgIGZpbHRlclN1Ym1pdEJ1dHRvbixcbiAgICAgIGZpbHRlclN1Ym1pdExhYmVsLFxuICAgICAgZ3JvdXBCeSxcbiAgICAgIGhlYWRlcixcbiAgICAgIGlkZW50aWZpZXIsXG4gICAgICBtb2RlbENsYXNzLFxuICAgICAgbm9SZWNvcmRzQXZhaWxhYmxlQ29udGVudCxcbiAgICAgIG5vUmVjb3Jkc0ZvdW5kQ29udGVudCxcbiAgICAgIG9uTW9kZWxzTG9hZGVkLFxuICAgICAgcGFnaW5hdGVDb250ZW50LFxuICAgICAgcGFnaW5hdGlvbkNvbXBvbmVudCxcbiAgICAgIHByZWxvYWRzLFxuICAgICAgcXVlcnlNZXRob2QsXG4gICAgICBxdWVyeU5hbWUsXG4gICAgICBzZWxlY3QsXG4gICAgICBzZWxlY3RDb2x1bW5zLFxuICAgICAgc3R5bGVVSSxcbiAgICAgIHZpZXdNb2RlbFBhdGgsXG4gICAgICB3b3JrcGxhY2UsXG4gICAgICAuLi5yZXN0UHJvcHNcbiAgICB9ID0gdGhpcy5wcm9wc1xuICAgIGNvbnN0IHttb2RlbHMsIHFQYXJhbXMsIHF1ZXJ5LCByZXN1bHR9ID0gZGlncyh0aGlzLmNvbGxlY3Rpb24sIFwibW9kZWxzXCIsIFwicVBhcmFtc1wiLCBcInF1ZXJ5XCIsIFwicmVzdWx0XCIpXG5cbiAgICBsZXQgaGVhZGVyQ29udGVudCwgUGFnaW5hdGlvbkNvbXBvbmVudFxuXG4gICAgaWYgKHR5cGVvZiBoZWFkZXIgPT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICBoZWFkZXJDb250ZW50ID0gaGVhZGVyKHttb2RlbHMsIHFQYXJhbXMsIHF1ZXJ5LCByZXN1bHR9KVxuICAgIH0gZWxzZSBpZiAoaGVhZGVyKSB7XG4gICAgICBoZWFkZXJDb250ZW50ID0gaGVhZGVyXG4gICAgfSBlbHNlIHtcbiAgICAgIGhlYWRlckNvbnRlbnQgPSBtb2RlbENsYXNzLm1vZGVsTmFtZSgpLmh1bWFuKHtjb3VudDogMn0pXG4gICAgfVxuXG4gICAgaWYgKCFwYWdpbmF0ZUNvbnRlbnQpIHtcbiAgICAgIGlmIChwYWdpbmF0aW9uQ29tcG9uZW50KSB7XG4gICAgICAgIFBhZ2luYXRpb25Db21wb25lbnQgPSBwYWdpbmF0aW9uQ29tcG9uZW50XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBQYWdpbmF0aW9uQ29tcG9uZW50ID0gUGFnaW5hdGVcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCBmbGF0TGlzdFN0eWxlID0ge1xuICAgICAgb3ZlcmZsb3dYOiBcImF1dG9cIlxuICAgIH1cblxuICAgIGlmIChzdHlsZVVJKSB7XG4gICAgICBmbGF0TGlzdFN0eWxlLmJvcmRlciA9IFwiMXB4IHNvbGlkICNkYmRiZGJcIlxuICAgICAgZmxhdExpc3RTdHlsZS5ib3JkZXJSYWRpdXMgPSA1XG4gICAgfVxuXG4gICAgY29uc3QgZmxhdExpc3QgPSAoXG4gICAgICA8VGFibGVDb250ZXh0LlByb3ZpZGVyIHZhbHVlPXt0aGlzLnR0LnRhYmxlQ29udGV4dFZhbHVlfT5cbiAgICAgICAgPEZsYXRMaXN0XG4gICAgICAgICAgZGF0YT17bW9kZWxzfVxuICAgICAgICAgIGRhdGFTZXQ9e3tcbiAgICAgICAgICAgIGNsYXNzOiBjbGFzc05hbWVzKFwiYXBpLW1ha2VyLS10YWJsZVwiLCBjbGFzc05hbWUpLFxuICAgICAgICAgICAgY2FjaGVLZXk6IHRoaXMucy50YWJsZVNldHRpbmdGdWxsQ2FjaGVLZXksXG4gICAgICAgICAgICBsYXN0VXBkYXRlOiB0aGlzLnMubGFzdFVwZGF0ZVxuICAgICAgICAgIH19XG4gICAgICAgICAgZXh0cmFEYXRhPXt0aGlzLnMubGFzdFVwZGF0ZX1cbiAgICAgICAgICBrZXlFeHRyYWN0b3I9e3RoaXMudHQua2V5RXh0cmF0b3J9XG4gICAgICAgICAgTGlzdEhlYWRlckNvbXBvbmVudD17TGlzdEhlYWRlckNvbXBvbmVudH1cbiAgICAgICAgICByZW5kZXJJdGVtPXt0aGlzLnR0LnJlbmRlckl0ZW19XG4gICAgICAgICAgc2hvd3NIb3Jpem9udGFsU2Nyb2xsSW5kaWNhdG9yXG4gICAgICAgICAgc3R5bGU9e2ZsYXRMaXN0U3R5bGV9XG4gICAgICAgICAgey4uLnJlc3RQcm9wc31cbiAgICAgICAgLz5cbiAgICAgIDwvVGFibGVDb250ZXh0LlByb3ZpZGVyPlxuICAgIClcblxuICAgIHJldHVybiAoXG4gICAgICA8PlxuICAgICAgICB7ZmlsdGVyQ29udGVudCAmJiBmaWx0ZXJDYXJkICYmXG4gICAgICAgICAgPENhcmQgY2xhc3NOYW1lPVwibGl2ZS10YWJsZS0tZmlsdGVyLWNhcmQgbWItNFwiPlxuICAgICAgICAgICAge3RoaXMuZmlsdGVyRm9ybSgpfVxuICAgICAgICAgIDwvQ2FyZD5cbiAgICAgICAgfVxuICAgICAgICB7ZmlsdGVyQ29udGVudCAmJiAhZmlsdGVyQ2FyZCAmJlxuICAgICAgICAgIHRoaXMuZmlsdGVyRm9ybSgpXG4gICAgICAgIH1cbiAgICAgICAge2NhcmQgJiZcbiAgICAgICAgICA8Q2FyZFxuICAgICAgICAgICAgY2xhc3NOYW1lPXtjbGFzc05hbWVzKFwibGl2ZS10YWJsZS0tdGFibGUtY2FyZFwiLCBcIm1iLTRcIiwgY2xhc3NOYW1lKX1cbiAgICAgICAgICAgIGNvbnRyb2xzPXt0aGlzLnRhYmxlQ29udHJvbHMoKX1cbiAgICAgICAgICAgIGhlYWRlcj17aGVhZGVyQ29udGVudH1cbiAgICAgICAgICAgIGZvb3Rlcj17dGhpcy50YWJsZUZvb3RlcigpfVxuICAgICAgICAgICAgey4uLnJlc3RQcm9wc31cbiAgICAgICAgICA+XG4gICAgICAgICAgICB7ZmxhdExpc3R9XG4gICAgICAgICAgPC9DYXJkPlxuICAgICAgICB9XG4gICAgICAgIHshY2FyZCAmJiBmbGF0TGlzdH1cbiAgICAgICAge3Jlc3VsdCAmJiBQYWdpbmF0aW9uQ29tcG9uZW50ICYmXG4gICAgICAgICAgPFBhZ2luYXRpb25Db21wb25lbnQgcmVzdWx0PXtyZXN1bHR9IC8+XG4gICAgICAgIH1cbiAgICAgICAge3Jlc3VsdCAmJiBwYWdpbmF0ZUNvbnRlbnQgJiZcbiAgICAgICAgICBwYWdpbmF0ZUNvbnRlbnQoe3Jlc3VsdH0pXG4gICAgICAgIH1cbiAgICAgIDwvPlxuICAgIClcbiAgfVxuXG4gIG9uQ29udGFpbmVyTGF5b3V0ID0gKGUpID0+IHtcbiAgICBjb25zdCB7d2lkdGh9ID0gZS5uYXRpdmVFdmVudC5sYXlvdXRcbiAgICBjb25zdCB7d2lkdGhzfSA9IHRoaXMuc1xuXG4gICAgdGhpcy5zZXRTdGF0ZSh7d2lkdGh9KVxuICAgIGlmICh3aWR0aHMpIHdpZHRocy50YWJsZVdpZHRoID0gd2lkdGhcbiAgfVxuXG4gIG9uTGlua3NDcmVhdGVkID0gKHthcmdzfSkgPT4ge1xuICAgIGNvbnN0IG1vZGVsQ2xhc3NOYW1lID0gdGhpcy5wLm1vZGVsQ2xhc3MubW9kZWxDbGFzc0RhdGEoKS5uYW1lXG5cbiAgICBpZiAoYXJncy5jcmVhdGVkW21vZGVsQ2xhc3NOYW1lXSkge1xuICAgICAgY29uc3QgYW1vdW50Q3JlYXRlZCA9IGFyZ3MuY3JlYXRlZFttb2RlbENsYXNzTmFtZV0ubGVuZ3RoXG5cbiAgICAgIHRoaXMuc2V0U3RhdGUoKHByZXZTdGF0ZSkgPT4gKHtcbiAgICAgICAgY3VycmVudFdvcmtwbGFjZUNvdW50OiBwcmV2U3RhdGUuY3VycmVudFdvcmtwbGFjZUNvdW50ICsgYW1vdW50Q3JlYXRlZFxuICAgICAgfSkpXG4gICAgfVxuICB9XG5cbiAgb25MaW5rc0Rlc3Ryb3llZCA9ICh7YXJnc30pID0+IHtcbiAgICBjb25zdCBtb2RlbENsYXNzTmFtZSA9IHRoaXMucC5tb2RlbENsYXNzLm1vZGVsQ2xhc3NEYXRhKCkubmFtZVxuXG4gICAgaWYgKGFyZ3MuZGVzdHJveWVkW21vZGVsQ2xhc3NOYW1lXSkge1xuICAgICAgY29uc3QgYW1vdW50RGVzdHJveWVkID0gYXJncy5kZXN0cm95ZWRbbW9kZWxDbGFzc05hbWVdLmxlbmd0aFxuXG4gICAgICB0aGlzLnNldFN0YXRlKChwcmV2U3RhdGUpID0+ICh7XG4gICAgICAgIGN1cnJlbnRXb3JrcGxhY2VDb3VudDogcHJldlN0YXRlLmN1cnJlbnRXb3JrcGxhY2VDb3VudCAtIGFtb3VudERlc3Ryb3llZFxuICAgICAgfSkpXG4gICAgfVxuICB9XG5cbiAga2V5RXh0cmF0b3IgPSAobW9kZWwpID0+IGAke3RoaXMucy50YWJsZVNldHRpbmdGdWxsQ2FjaGVLZXl9LSR7bW9kZWwuaWQoKX1gXG5cbiAgZmlsdGVyRm9ybSA9ICgpID0+IHtcbiAgICBjb25zdCB7ZmlsdGVyRm9ybVJlZiwgc3VibWl0RmlsdGVyLCBzdWJtaXRGaWx0ZXJEZWJvdW5jZX0gPSB0aGlzLnR0XG4gICAgY29uc3Qge2ZpbHRlckNvbnRlbnQsIGZpbHRlclN1Ym1pdEJ1dHRvbn0gPSB0aGlzLnBcbiAgICBjb25zdCB7cXVlcnlRTmFtZX0gPSB0aGlzLnNcbiAgICBjb25zdCB7ZmlsdGVyU3VibWl0TGFiZWx9ID0gdGhpcy5wcm9wc1xuICAgIGNvbnN0IHtxUGFyYW1zfSA9IGRpZ3ModGhpcy5jb2xsZWN0aW9uLCBcInFQYXJhbXNcIilcblxuICAgIHJldHVybiAoXG4gICAgICA8Rm9ybSBjbGFzc05hbWU9XCJsaXZlLXRhYmxlLS1maWx0ZXItZm9ybVwiIGZvcm1SZWY9e2ZpbHRlckZvcm1SZWZ9IG9uU3VibWl0PXt0aGlzLnR0Lm9uRmlsdGVyRm9ybVN1Ym1pdH0gc2V0Rm9ybT17dGhpcy5zZXRTdGF0ZXMuZmlsdGVyRm9ybX0+XG4gICAgICAgIHtcInNcIiBpbiBxUGFyYW1zICYmXG4gICAgICAgICAgPGlucHV0IG5hbWU9XCJzXCIgdHlwZT1cImhpZGRlblwiIHZhbHVlPXtxUGFyYW1zLnN9IC8+XG4gICAgICAgIH1cbiAgICAgICAge2ZpbHRlckNvbnRlbnQoe1xuICAgICAgICAgIG9uRmlsdGVyQ2hhbmdlZDogc3VibWl0RmlsdGVyLFxuICAgICAgICAgIG9uRmlsdGVyQ2hhbmdlZFdpdGhEZWxheTogc3VibWl0RmlsdGVyRGVib3VuY2UsXG4gICAgICAgICAgcVBhcmFtcyxcbiAgICAgICAgICBxdWVyeVFOYW1lXG4gICAgICAgIH0pfVxuICAgICAgICB7ZmlsdGVyU3VibWl0QnV0dG9uICYmXG4gICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICBjbGFzc05hbWU9XCJidG4gYnRuLXByaW1hcnkgbGl2ZS10YWJsZS0tc3VibWl0LWZpbHRlci1idXR0b25cIlxuICAgICAgICAgICAgdHlwZT1cInN1Ym1pdFwiXG4gICAgICAgICAgICBzdHlsZT17e21hcmdpblRvcDogXCI4cHhcIn19XG4gICAgICAgICAgICB2YWx1ZT17ZmlsdGVyU3VibWl0TGFiZWwgfHwgdGhpcy50KFwiLmZpbHRlclwiLCB7ZGVmYXVsdFZhbHVlOiBcIkZpbHRlclwifSl9XG4gICAgICAgICAgLz5cbiAgICAgICAgfVxuICAgICAgPC9Gb3JtPlxuICAgIClcbiAgfVxuXG4gIG9uRmlsdGVyQ2xpY2tlZCA9IChlKSA9PiB7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgdGhpcy5zZXRTdGF0ZSh7c2hvd0ZpbHRlcnM6ICF0aGlzLnN0YXRlLnNob3dGaWx0ZXJzfSlcbiAgfVxuXG4gIG9uUGVyUGFnZUNoYW5nZWQgPSAoZSkgPT4ge1xuICAgIGNvbnN0IHtxdWVyeU5hbWV9ID0gdGhpcy5zXG4gICAgY29uc3QgbmV3UGVyUGFnZVZhbHVlID0gZGlnZyhlLCBcInRhcmdldFwiLCBcInZhbHVlXCIpXG4gICAgY29uc3QgcGVyS2V5ID0gYCR7cXVlcnlOYW1lfV9wZXJgXG4gICAgY29uc3QgcGFyYW1zQ2hhbmdlID0ge31cblxuICAgIHBhcmFtc0NoYW5nZVtwZXJLZXldID0gbmV3UGVyUGFnZVZhbHVlXG5cbiAgICBQYXJhbXMuY2hhbmdlUGFyYW1zKHBhcmFtc0NoYW5nZSlcbiAgfVxuXG4gIHJlbmRlckl0ZW0gPSAoe2luZGV4LCBpdGVtOiBtb2RlbH0pID0+IHtcbiAgICBpZiAoIXRoaXMucy50YWJsZVNldHRpbmdMb2FkZWQpIHtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIDxWaWV3PlxuICAgICAgICAgIDxUZXh0PlxuICAgICAgICAgICAge3RoaXMudChcIi5sb2FkaW5nX2RvdF9kb3RfZG90XCIsIHtkZWZhdWx0VmFsdWU6IFwiTG9hZGluZy4uLlwifSl9XG4gICAgICAgICAgPC9UZXh0PlxuICAgICAgICA8L1ZpZXc+XG4gICAgICApXG4gICAgfVxuXG4gICAgcmV0dXJuIChcbiAgICAgIDxNb2RlbFJvd1xuICAgICAgICBjYWNoZUtleT17bW9kZWwuY2FjaGVLZXkoKX1cbiAgICAgICAgY29sdW1ucz17dGhpcy5zLmNvbHVtbnNUb1Nob3d9XG4gICAgICAgIGNvbHVtbldpZHRocz17dGhpcy5jb2x1bW5XaWR0aHMoKX1cbiAgICAgICAgZXZlbnRzPXt0aGlzLnR0LmV2ZW50c31cbiAgICAgICAgaW5kZXg9e2luZGV4fVxuICAgICAgICBrZXk9e21vZGVsLmlkKCl9XG4gICAgICAgIG1vZGVsPXttb2RlbH1cbiAgICAgICAgdGFibGU9e3RoaXN9XG4gICAgICAgIHRhYmxlU2V0dGluZ0Z1bGxDYWNoZUtleT17dGhpcy5zLnRhYmxlU2V0dGluZ0Z1bGxDYWNoZUtleX1cbiAgICAgIC8+XG4gICAgKVxuICB9XG5cbiAgc3R5bGVGb3JDb2x1bW4gPSAoe2NvbHVtbiwgY29sdW1uSW5kZXgsIGV2ZW4sIHN0eWxlLCB0eXBlfSkgPT4ge1xuICAgIGNvbnN0IHtzdHlsZVVJfSA9IHRoaXMucFxuICAgIGNvbnN0IGRlZmF1bHRTdHlsZSA9IHtcbiAgICAgIGp1c3RpZnlDb250ZW50OiBcImNlbnRlclwiLFxuICAgICAgcGFkZGluZzogOCxcbiAgICAgIG92ZXJmbG93OiBcImhpZGRlblwiXG4gICAgfVxuXG4gICAgaWYgKHN0eWxlVUkpIHtcbiAgICAgIE9iamVjdC5hc3NpZ24oZGVmYXVsdFN0eWxlLCB7XG4gICAgICAgIGJhY2tncm91bmRDb2xvcjogZXZlbiA/IFwiI2Y1ZjVmNVwiIDogXCIjZmZmXCJcbiAgICAgIH0pXG4gICAgfVxuXG4gICAgaWYgKHR5cGUgPT0gXCJhY3Rpb25zXCIpIHtcbiAgICAgIGRlZmF1bHRTdHlsZS5mbGV4RGlyZWN0aW9uID0gXCJyb3dcIlxuICAgICAgZGVmYXVsdFN0eWxlLmFsaWduSXRlbXMgPSBcImNlbnRlclwiXG5cbiAgICAgIGlmICh0aGlzLnR0Lm1kVXApIHtcbiAgICAgICAgZGVmYXVsdFN0eWxlLm1hcmdpbkxlZnQgPSBcImF1dG9cIlxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZGVmYXVsdFN0eWxlLm1hcmdpblJpZ2h0ID0gXCJhdXRvXCJcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKHRoaXMudHQubWRVcCAmJiBzdHlsZVVJKSB7XG4gICAgICBkZWZhdWx0U3R5bGUuYm9yZGVyUmlnaHQgPSBcIjFweCBzb2xpZCAjZGJkYmRiXCJcbiAgICB9XG5cbiAgICBjb25zdCBhY3R1YWxTdHlsZSA9IE9iamVjdC5hc3NpZ24oXG4gICAgICBkZWZhdWx0U3R5bGUsXG4gICAgICBzdHlsZVxuICAgIClcblxuICAgIHJldHVybiBhY3R1YWxTdHlsZVxuICB9XG5cbiAgc3R5bGVGb3JIZWFkZXIgPSAoe2NvbHVtbiwgY29sdW1uSW5kZXgsIHN0eWxlLCB0eXBlfSkgPT4ge1xuICAgIGNvbnN0IHttZFVwfSA9IHRoaXMudHRcbiAgICBjb25zdCBkZWZhdWx0U3R5bGUgPSB7XG4gICAgICBmbGV4RGlyZWN0aW9uOiBcInJvd1wiLFxuICAgICAgYWxpZ25JdGVtczogXCJjZW50ZXJcIixcbiAgICAgIHBhZGRpbmc6IDhcbiAgICB9XG5cbiAgICBpZiAodHlwZSAhPSBcImFjdGlvbnNcIiAmJiBtZFVwICYmIHRoaXMucC5zdHlsZVVJKSB7XG4gICAgICBkZWZhdWx0U3R5bGUuYm9yZGVyUmlnaHQgPSBcIjFweCBzb2xpZCAjZGJkYmRiXCJcbiAgICB9XG5cbiAgICBjb25zdCBhY3R1YWxTdHlsZSA9IE9iamVjdC5hc3NpZ24oXG4gICAgICBkZWZhdWx0U3R5bGUsXG4gICAgICBzdHlsZVxuICAgIClcblxuICAgIHJldHVybiBhY3R1YWxTdHlsZVxuICB9XG5cbiAgc3R5bGVGb3JIZWFkZXJUZXh0KCkge1xuICAgIGNvbnN0IGFjdHVhbFN0eWxlID0ge2ZvbnRXZWlnaHQ6IFwiYm9sZFwifVxuXG4gICAgcmV0dXJuIGFjdHVhbFN0eWxlXG4gIH1cblxuICBzdHlsZUZvclJvdyA9ICh7ZXZlbn0gPSB7fSkgPT4ge1xuICAgIGNvbnN0IGFjdHVhbFN0eWxlID0ge1xuICAgICAgZmxleDogMSxcbiAgICAgIGFsaWduSXRlbXM6IFwic3RyZXRjaFwiXG4gICAgfVxuXG4gICAgaWYgKGV2ZW4gJiYgdGhpcy5wLnN0eWxlVUkpIHtcbiAgICAgIGFjdHVhbFN0eWxlLmJhY2tncm91bmRDb2xvciA9IFwiI2Y1ZjVmNVwiXG4gICAgfVxuXG4gICAgcmV0dXJuIGFjdHVhbFN0eWxlXG4gIH1cblxuICBzdHlsZUZvclJvd0hlYWRlciA9ICgpID0+IHtcbiAgICBjb25zdCBhY3R1YWxTdHlsZSA9IHtcbiAgICAgIGZsZXg6IDEsXG4gICAgICBhbGlnbkl0ZW1zOiBcInN0cmV0Y2hcIlxuICAgIH1cblxuICAgIHJldHVybiBhY3R1YWxTdHlsZVxuICB9XG5cbiAgdGFibGVDb250cm9scygpIHtcbiAgICBjb25zdCB7Y29udHJvbHN9ID0gdGhpcy5wcm9wc1xuICAgIGNvbnN0IHtzaG93U2V0dGluZ3N9ID0gdGhpcy5zXG4gICAgY29uc3Qge21vZGVscywgcVBhcmFtcywgcXVlcnksIHJlc3VsdH0gPSBkaWdzKHRoaXMuY29sbGVjdGlvbiwgXCJtb2RlbHNcIiwgXCJxUGFyYW1zXCIsIFwicXVlcnlcIiwgXCJyZXN1bHRcIilcblxuICAgIHJldHVybiAoXG4gICAgICA8VmlldyBzdHlsZT17dGhpcy5jYWNoZShcInRhYmxlQ29udHJvbHNSb290Vmlld1N0eWxlXCIsIHtmbGV4RGlyZWN0aW9uOiBcInJvd1wifSl9PlxuICAgICAgICB7Y29udHJvbHMgJiYgY29udHJvbHMoe21vZGVscywgcVBhcmFtcywgcXVlcnksIHJlc3VsdH0pfVxuICAgICAgICA8UHJlc3NhYmxlIGRhdGFTZXQ9e3tjbGFzczogXCJmaWx0ZXItYnV0dG9uXCJ9fSBvblByZXNzPXt0aGlzLnR0Lm9uRmlsdGVyQ2xpY2tlZH0+XG4gICAgICAgICAgPEljb24gbmFtZT1cInNlYXJjaFwiIHNpemU9ezIwfSAvPlxuICAgICAgICA8L1ByZXNzYWJsZT5cbiAgICAgICAgPFZpZXc+XG4gICAgICAgICAge3Nob3dTZXR0aW5ncyAmJlxuICAgICAgICAgICAgPFNldHRpbmdzIG9uUmVxdWVzdENsb3NlPXt0aGlzLnR0Lm9uUmVxdWVzdENsb3NlU2V0dGluZ3N9IHRhYmxlPXt0aGlzfSAvPlxuICAgICAgICAgIH1cbiAgICAgICAgICA8UHJlc3NhYmxlIGRhdGFTZXQ9e3RoaXMuY2FjaGUoXCJzZXR0aW5nc0J1dHRvbkRhdGFTZXRcIiwge2NsYXNzOiBcInNldHRpbmdzLWJ1dHRvblwifSl9IG9uUHJlc3M9e3RoaXMudHQub25TZXR0aW5nc0NsaWNrZWR9PlxuICAgICAgICAgICAgPEljb24gbmFtZT1cImdlYXJcIiBzaXplPXsyMH0gLz5cbiAgICAgICAgICA8L1ByZXNzYWJsZT5cbiAgICAgICAgPC9WaWV3PlxuICAgICAgPC9WaWV3PlxuICAgIClcbiAgfVxuXG4gIHRhYmxlRm9vdGVyKCkge1xuICAgIGNvbnN0IHtyZXN1bHR9ID0gZGlncyh0aGlzLmNvbGxlY3Rpb24sIFwicmVzdWx0XCIpXG4gICAgY29uc3QgY3VycmVudFBhZ2UgPSByZXN1bHQuY3VycmVudFBhZ2UoKVxuICAgIGNvbnN0IHRvdGFsQ291bnQgPSByZXN1bHQudG90YWxDb3VudCgpXG4gICAgY29uc3QgcGVyUGFnZSA9IHJlc3VsdC5wZXJQYWdlKClcbiAgICBjb25zdCB0byA9IE1hdGgubWluKGN1cnJlbnRQYWdlICogcGVyUGFnZSwgdG90YWxDb3VudClcbiAgICBjb25zdCBkZWZhdWx0VmFsdWUgPSBcIlNob3dpbmcgJXtmcm9tfSB0byAle3RvfSBvdXQgb2YgJXt0b3RhbF9jb3VudH0gdG90YWwuXCJcbiAgICBsZXQgZnJvbSA9ICgoY3VycmVudFBhZ2UgLSAxKSAqIHBlclBhZ2UpICsgMVxuXG4gICAgaWYgKHRvID09PSAwKSBmcm9tID0gMFxuXG4gICAgcmV0dXJuIChcbiAgICAgIDxWaWV3IHN0eWxlPXt0aGlzLmNhY2hlKFwidGFibGVGb290ZXJSb290Vmlld1N0eWxlXCIsIHtmbGV4RGlyZWN0aW9uOiBcInJvd1wiLCBqdXN0aWZ5Q29udGVudDogXCJzcGFjZS1iZXR3ZWVuXCIsIG1hcmdpblRvcDogMTB9KX0+XG4gICAgICAgIDxWaWV3IGRhdGFTZXQ9e3RoaXMuY2FjaGUoXCJzaG93aW5nQ291bnRzRGF0YVNldFwiLCB7Y2xhc3M6IFwic2hvd2luZy1jb3VudHNcIn0pfSBzdHlsZT17dGhpcy5jYWNoZShcInNob3dpbmdDb3VudHNTdHlsZVwiLCB7ZmxleERpcmVjdGlvbjogXCJyb3dcIn0pfT5cbiAgICAgICAgICA8VGV4dD5cbiAgICAgICAgICAgIHt0aGlzLnQoXCIuc2hvd2luZ19mcm9tX3RvX291dF9vZl90b3RhbFwiLCB7ZGVmYXVsdFZhbHVlLCBmcm9tLCB0bywgdG90YWxfY291bnQ6IHRvdGFsQ291bnR9KX1cbiAgICAgICAgICA8L1RleHQ+XG4gICAgICAgICAge3RoaXMucC53b3JrcGxhY2UgJiYgdGhpcy5zLmN1cnJlbnRXb3JrcGxhY2VDb3VudCAhPT0gbnVsbCAmJlxuICAgICAgICAgICAgPFRleHQgc3R5bGU9e3RoaXMuY2FjaGUoXCJ4U2VsZWN0ZWRUZXh0U3R5bGVcIiwge21hcmdpbkxlZnQ6IDN9KX0+XG4gICAgICAgICAgICAgIHt0aGlzLnQoXCIueF9zZWxlY3RlZFwiLCB7ZGVmYXVsdFZhbHVlOiBcIiV7c2VsZWN0ZWR9IHNlbGVjdGVkLlwiLCBzZWxlY3RlZDogdGhpcy5zLmN1cnJlbnRXb3JrcGxhY2VDb3VudH0pfVxuICAgICAgICAgICAgPC9UZXh0PlxuICAgICAgICAgIH1cbiAgICAgICAgPC9WaWV3PlxuICAgICAgICA8Vmlldz5cbiAgICAgICAgICA8U2VsZWN0XG4gICAgICAgICAgICBjbGFzc05hbWU9XCJwZXItcGFnZS1zZWxlY3RcIlxuICAgICAgICAgICAgZGVmYXVsdFZhbHVlPXtwZXJQYWdlfVxuICAgICAgICAgICAgb25DaGFuZ2U9e3RoaXMudHQub25QZXJQYWdlQ2hhbmdlZH1cbiAgICAgICAgICAgIG9wdGlvbnM9e3BhZ2luYXRpb25PcHRpb25zfVxuICAgICAgICAgIC8+XG4gICAgICAgIDwvVmlldz5cbiAgICAgIDwvVmlldz5cbiAgICApXG4gIH1cblxuICBjbGFzc05hbWUoKSB7XG4gICAgY29uc3QgY2xhc3NOYW1lcyA9IFtcImFwaS1tYWtlci0tdGFibGVcIl1cblxuICAgIGlmICh0aGlzLnByb3BzLmNsYXNzTmFtZSkge1xuICAgICAgY2xhc3NOYW1lcy5wdXNoKHRoaXMucHJvcHMuY2xhc3NOYW1lKVxuICAgIH1cblxuICAgIHJldHVybiBjbGFzc05hbWVzLmpvaW4oXCIgXCIpXG4gIH1cblxuICBjb2x1bW5Qcm9wcyhjb2x1bW4pIHtcbiAgICBjb25zdCBwcm9wcyA9IHt9XG5cbiAgICBpZiAoY29sdW1uLnRleHRDZW50ZXIpIHtcbiAgICAgIHByb3BzLnN0eWxlIHx8PSB7fVxuICAgICAgcHJvcHMuc3R5bGUudGV4dEFsaWduID0gXCJjZW50ZXJcIlxuICAgIH1cblxuICAgIGlmIChjb2x1bW4udGV4dFJpZ2h0KSB7XG4gICAgICBwcm9wcy5zdHlsZSB8fD0ge31cbiAgICAgIHByb3BzLnN0eWxlLnRleHRBbGlnbiA9IFwicmlnaHRcIlxuICAgIH1cblxuICAgIHJldHVybiBwcm9wc1xuICB9XG5cbiAgaGVhZGVyUHJvcHMoY29sdW1uKSB7XG4gICAgY29uc3QgcHJvcHMgPSB7fVxuXG4gICAgaWYgKGNvbHVtbi50ZXh0Q2VudGVyKSB7XG4gICAgICBwcm9wcy5zdHlsZSB8fD0ge31cbiAgICAgIHByb3BzLnN0eWxlLmp1c3RpZnlDb250ZW50ID0gXCJjZW50ZXJcIlxuICAgIH1cblxuICAgIGlmIChjb2x1bW4udGV4dFJpZ2h0KSB7XG4gICAgICBwcm9wcy5zdHlsZSB8fD0ge31cbiAgICAgIHByb3BzLnN0eWxlLmp1c3RpZnlDb250ZW50ID0gXCJlbmRcIlxuICAgIH1cblxuICAgIHJldHVybiBwcm9wc1xuICB9XG5cbiAgY29sdW1uV2lkdGhzKCkge1xuICAgIGNvbnN0IGNvbHVtbldpZHRocyA9IHt9XG5cbiAgICBmb3IgKGNvbnN0IGNvbHVtbiBvZiB0aGlzLnMucHJlcGFyZWRDb2x1bW5zKSB7XG4gICAgICBjb2x1bW5XaWR0aHNbY29sdW1uLnRhYmxlU2V0dGluZ0NvbHVtbi5pZGVudGlmaWVyKCldID0gY29sdW1uLndpZHRoXG4gICAgfVxuXG4gICAgcmV0dXJuIGNvbHVtbldpZHRoc1xuICB9XG5cbiAgaGVhZGVyc0NvbnRlbnRGcm9tQ29sdW1ucyA9ICgpID0+IHtcbiAgICByZXR1cm4gKFxuICAgICAgPERyYWdnYWJsZVNvcnRcbiAgICAgICAgZGF0YT17dGhpcy5zLmNvbHVtbnNUb1Nob3d9XG4gICAgICAgIGV2ZW50cz17dGhpcy50dC5kcmFnZ2FibGVTb3J0RXZlbnRzfVxuICAgICAgICBob3Jpem9udGFsXG4gICAgICAgIGtleUV4dHJhY3Rvcj17dGhpcy50dC5kcmFnTGlzdGtleUV4dHJhY3Rvcn1cbiAgICAgICAgb25JdGVtTW92ZWQ9e3RoaXMudHQub25JdGVtTW92ZWR9XG4gICAgICAgIG9uUmVvcmRlcmVkPXt0aGlzLnR0Lm9uUmVvcmRlcmVkfVxuICAgICAgICByZW5kZXJJdGVtPXt0aGlzLnR0LmRyYWdMaXN0UmVuZGVySXRlbUNvbnRlbnR9XG4gICAgICAvPlxuICAgIClcbiAgfVxuXG4gIGRyYWdMaXN0Q2FjaGVLZXlFeHRyYWN0b3IgPSAoaXRlbSkgPT4gYCR7aXRlbS50YWJsZVNldHRpbmdDb2x1bW4uaWRlbnRpZmllcigpfS0ke3RoaXMucy5yZXNpemluZ31gXG4gIGRyYWdMaXN0a2V5RXh0cmFjdG9yID0gKGl0ZW0pID0+IGl0ZW0udGFibGVTZXR0aW5nQ29sdW1uLmlkZW50aWZpZXIoKVxuXG4gIG9uSXRlbU1vdmVkID0gKHthbmltYXRpb25BcmdzLCBpdGVtSW5kZXgsIHgsIHl9KSA9PiB7XG4gICAgY29uc3QgYW5pbWF0ZWRQb3NpdGlvbiA9IGRpZ2codGhpcywgXCJzXCIsIFwiY29sdW1uc1RvU2hvd1wiLCBpdGVtSW5kZXgsIFwiYW5pbWF0ZWRQb3NpdGlvblwiKVxuXG4gICAgaWYgKGFuaW1hdGlvbkFyZ3MpIHtcbiAgICAgIEFuaW1hdGVkLnRpbWluZyhhbmltYXRlZFBvc2l0aW9uLCBhbmltYXRpb25BcmdzKS5zdGFydCgpXG4gICAgfSBlbHNlIHtcbiAgICAgIGFuaW1hdGVkUG9zaXRpb24uc2V0VmFsdWUoe3gsIHl9KVxuICAgIH1cbiAgfVxuXG4gIG9uUmVvcmRlcmVkID0gYXN5bmMgKHtmcm9tSXRlbSwgZnJvbVBvc2l0aW9uLCB0b0l0ZW0sIHRvUG9zaXRpb259KSA9PiB7XG4gICAgaWYgKGZyb21Qb3NpdGlvbiA9PSB0b1Bvc2l0aW9uKSByZXR1cm4gLy8gT25seSBkbyByZXF1ZXN0cyBhbmQgcXVlcmllcyBpZiBjaGFuZ2VkXG5cbiAgICBjb25zdCBUYWJsZVNldHRpbmdDb2x1bW4gPSBmcm9tSXRlbS50YWJsZVNldHRpbmdDb2x1bW4uY29uc3RydWN0b3JcbiAgICBjb25zdCB0b0NvbHVtbiA9IGF3YWl0IFRhYmxlU2V0dGluZ0NvbHVtbi5maW5kKHRvSXRlbS50YWJsZVNldHRpbmdDb2x1bW4uaWQoKSkgLy8gTmVlZCB0byBsb2FkIGxhdGVzdCBwb3NpdGlvbiBiZWNhdXNlIEFjdHNBc0xpc3QgbWlnaHQgaGF2ZSBjaGFuZ2VkIGl0XG5cbiAgICBhd2FpdCBmcm9tSXRlbS50YWJsZVNldHRpbmdDb2x1bW4udXBkYXRlKHtwb3NpdGlvbjogdG9Db2x1bW4ucG9zaXRpb24oKX0pXG4gIH1cblxuICBkcmFnTGlzdFJlbmRlckl0ZW1Db250ZW50ID0gKHtpc0FjdGl2ZSwgaXRlbSwgdG91Y2hQcm9wc30pID0+IHtcbiAgICBjb25zdCB7YW5pbWF0ZWRXaWR0aCwgYW5pbWF0ZWRaSW5kZXgsIGNvbHVtbiwgdGFibGVTZXR0aW5nQ29sdW1ufSA9IGl0ZW1cblxuICAgIHJldHVybiAoXG4gICAgICA8SGVhZGVyQ29sdW1uXG4gICAgICAgIGFjdGl2ZT17aXNBY3RpdmV9XG4gICAgICAgIGFuaW1hdGVkV2lkdGg9e2FuaW1hdGVkV2lkdGh9XG4gICAgICAgIGFuaW1hdGVkWkluZGV4PXthbmltYXRlZFpJbmRleH1cbiAgICAgICAgY29sdW1uPXtjb2x1bW59XG4gICAgICAgIGtleT17dGFibGVTZXR0aW5nQ29sdW1uLmlkZW50aWZpZXIoKX1cbiAgICAgICAgcmVzaXppbmc9e3RoaXMucy5yZXNpemluZ31cbiAgICAgICAgdGFibGU9e3RoaXN9XG4gICAgICAgIHRhYmxlU2V0dGluZ0NvbHVtbj17dGFibGVTZXR0aW5nQ29sdW1ufVxuICAgICAgICB0b3VjaFByb3BzPXt0b3VjaFByb3BzfVxuICAgICAgICB3aWR0aHM9e3RoaXMucy53aWR0aHN9XG4gICAgICAvPlxuICAgIClcbiAgfVxuXG4gIGhlYWRlckNsYXNzTmFtZUZvckNvbHVtbihjb2x1bW4pIHtcbiAgICBjb25zdCBjbGFzc05hbWVzID0gW11cblxuICAgIGlmIChjb2x1bW4uY29tbW9uUHJvcHMgJiYgY29sdW1uLmNvbW1vblByb3BzLmNsYXNzTmFtZSkgY2xhc3NOYW1lcy5wdXNoKGNvbHVtbi5jb21tb25Qcm9wcy5jbGFzc05hbWUpXG4gICAgaWYgKGNvbHVtbi5oZWFkZXJQcm9wcyAmJiBjb2x1bW4uaGVhZGVyUHJvcHMuY2xhc3NOYW1lKSBjbGFzc05hbWVzLnB1c2goY29sdW1uLmhlYWRlclByb3BzLmNsYXNzTmFtZSlcblxuICAgIHJldHVybiBjbGFzc05hbWVzXG4gIH1cblxuICBoZWFkZXJMYWJlbEZvckNvbHVtbihjb2x1bW4pIHtcbiAgICBjb25zdCB7bW9kZWxDbGFzc30gPSB0aGlzLnBcblxuICAgIGlmIChcImxhYmVsXCIgaW4gY29sdW1uKSB7XG4gICAgICBpZiAodHlwZW9mIGNvbHVtbi5sYWJlbCA9PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgcmV0dXJuIGNvbHVtbi5sYWJlbCgpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gY29sdW1uLmxhYmVsXG4gICAgICB9XG4gICAgfVxuXG4gICAgbGV0IGN1cnJlbnRNb2RlbENsYXNzID0gbW9kZWxDbGFzc1xuXG4gICAgLy8gQ2FsY3VsYXRlIGN1cnJlbnQgbW9kZWwgY2xhc3MgdGhyb3VnaCBwYXRoXG4gICAgaWYgKGNvbHVtbi5wYXRoKSB7XG4gICAgICBmb3IgKGNvbnN0IHBhdGhQYXJ0IG9mIGNvbHVtbi5wYXRoKSB7XG4gICAgICAgIGNvbnN0IHJlbGF0aW9uc2hpcHMgPSBkaWdnKGN1cnJlbnRNb2RlbENsYXNzLm1vZGVsQ2xhc3NEYXRhKCksIFwicmVsYXRpb25zaGlwc1wiKVxuICAgICAgICBjb25zdCByZWxhdGlvbnNoaXAgPSByZWxhdGlvbnNoaXBzLmZpbmQoKHJlbGF0aW9uc2hpcEluQXJyYXkpID0+IHJlbGF0aW9uc2hpcEluQXJyYXkubmFtZSA9PSBpbmZsZWN0aW9uLnVuZGVyc2NvcmUocGF0aFBhcnQpKVxuXG4gICAgICAgIGN1cnJlbnRNb2RlbENsYXNzID0gbW9kZWxDbGFzc1JlcXVpcmUoZGlnZyhyZWxhdGlvbnNoaXAsIFwicmVzb3VyY2VfbmFtZVwiKSlcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoY29sdW1uLmF0dHJpYnV0ZSkgcmV0dXJuIGN1cnJlbnRNb2RlbENsYXNzLmh1bWFuQXR0cmlidXRlTmFtZShjb2x1bW4uYXR0cmlidXRlKVxuXG4gICAgdGhyb3cgbmV3IEVycm9yKFwiTm8gJ2xhYmVsJyBvciAnYXR0cmlidXRlJyB3YXMgZ2l2ZW5cIilcbiAgfVxuXG4gIG9uRmlsdGVyRm9ybVN1Ym1pdCA9ICgpID0+IHRoaXMuc3VibWl0RmlsdGVyKClcbiAgb25SZXF1ZXN0Q2xvc2VTZXR0aW5ncyA9ICgpID0+IHRoaXMuc2V0U3RhdGUoe3Nob3dTZXR0aW5nczogZmFsc2V9KVxuXG4gIG9uU2V0dGluZ3NDbGlja2VkID0gKGUpID0+IHtcbiAgICBlLnByZXZlbnREZWZhdWx0KClcblxuICAgIHRoaXMuc2V0U3RhdGUoe3Nob3dTZXR0aW5nczogIXRoaXMucy5zaG93U2V0dGluZ3N9KVxuICB9XG5cbiAgc3VibWl0RmlsdGVyID0gKCkgPT4ge1xuICAgIGNvbnN0IHthcHBIaXN0b3J5fSA9IHRoaXMucHJvcHNcbiAgICBjb25zdCB7cXVlcnlRTmFtZX0gPSB0aGlzLnNcbiAgICBjb25zdCBjaGFuZ2VQYXJhbXNQYXJhbXMgPSB7fVxuICAgIGNvbnN0IHFQYXJhbXMgPSB0aGlzLnMuZmlsdGVyRm9ybS5hc09iamVjdCgpXG5cbiAgICBpZiAoUGxhdGZvcm0uT1MgPT0gXCJ3ZWJcIikge1xuICAgICAgY29uc3QgZmlsdGVyRm9ybSA9IGRpZ2codGhpcy50dC5maWx0ZXJGb3JtUmVmLCBcImN1cnJlbnRcIilcbiAgICAgIGNvbnN0IG5hdnRpdmVGb3JtUGFyYW1zID0gUGFyYW1zLnNlcmlhbGl6ZUZvcm0oZmlsdGVyRm9ybSlcblxuICAgICAgaW5jb3Jwb3JhdGUocVBhcmFtcywgbmF2dGl2ZUZvcm1QYXJhbXMpXG4gICAgfVxuXG4gICAgY2hhbmdlUGFyYW1zUGFyYW1zW3F1ZXJ5UU5hbWVdID0gSlNPTi5zdHJpbmdpZnkocVBhcmFtcylcblxuICAgIFBhcmFtcy5jaGFuZ2VQYXJhbXMoY2hhbmdlUGFyYW1zUGFyYW1zLCB7YXBwSGlzdG9yeX0pXG4gIH1cblxuICBzdWJtaXRGaWx0ZXJEZWJvdW5jZSA9IGRlYm91bmNlKHRoaXMudHQuc3VibWl0RmlsdGVyKVxufSkpXG4iXX0=