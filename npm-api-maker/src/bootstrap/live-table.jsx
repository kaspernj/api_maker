import Card from "./card"
import classNames from "classnames"
import Collection from "../collection"
import CollectionLoader from "../collection-loader"
import debounce from "debounce"
import {digg, digs} from "diggerize"
import instanceOfClassName from "../instance-of-class-name"
import ModelRow from "./live-table/model-row"
import Paginate from "./paginate"
import Params from "../params"
import PropTypes from "prop-types"
import React, {memo} from "react"
import {shapeComponent, ShapeComponent} from "set-state-compare/src/shape-component.js"
import SortLink from "./sort-link"

export default memo(shapeComponent(class ApiMakerBootstrapLiveTable extends ShapeComponent {
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
    defaultParams: PropTypes.object,
    destroyEnabled: PropTypes.bool.isRequired,
    destroyMessage: PropTypes.string,
    editModelPath: PropTypes.func,
    filterCard: PropTypes.bool.isRequired,
    filterContent: PropTypes.func,
    filterSubmitButton: PropTypes.bool.isRequired,
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
    selectColumns: PropTypes.object,
    viewModelPath: PropTypes.func
  }

  setup() {
    let queryName = this.props.queryName

    if (!queryName) {
      queryName = digg(this.props.modelClass.modelClassData(), "collectionKey")
    }

    this.useStates({
      columns: () => this.columnsAsArray(),
      models: undefined,
      overallCount: undefined,
      query: undefined,
      queryName,
      queryQName: `${queryName}_q`,
      queryPageName: `${queryName}_page`,
      qParams: undefined,
      result: undefined,
      showNoRecordsAvailableContent: false,
      showNoRecordsFoundContent: false
    })
  }

  columnsAsArray () {
    if (typeof this.props.columns == "function") {
      return this.props.columns()
    }

    return this.props.columns
  }

  render () {
    const {modelClass, noRecordsAvailableContent, noRecordsFoundContent} = digs(this.props, "modelClass", "noRecordsAvailableContent", "noRecordsFoundContent")
    const {collection, defaultParams, onModelsLoaded, preloads, select, selectColumns} = this.props
    const {
      overallCount,
      qParams,
      query,
      result,
      models,
      showNoRecordsAvailableContent,
      showNoRecordsFoundContent
    } = digs(
      this.state,
      "overallCount",
      "qParams",
      "query",
      "result",
      "models",
      "showNoRecordsAvailableContent",
      "showNoRecordsFoundContent"
    )

    return (
      <div className={this.className()}>
        <CollectionLoader
          abilities={this.abilitiesToLoad()}
          defaultParams={defaultParams}
          collection={collection}
          component={this}
          modelClass={modelClass}
          noRecordsAvailableContent={noRecordsAvailableContent}
          noRecordsFoundContent={noRecordsFoundContent}
          onModelsLoaded={onModelsLoaded}
          pagination
          preloads={preloads}
          select={select}
          selectColumns={selectColumns}
        />
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
      viewModelPath,
      ...restProps
    } = this.props
    const {models, qParams, query, result} = digs(this.state, "models", "qParams", "query", "result")

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
    const {qParams} = digs(this.state, "qParams")

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
    const {query, models} = this.state

    return (
      <>
        <thead>
          <tr>
            {this.state.columns && this.headersContentFromColumns()}
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
    const {columns} = digs(this.state, "columns")

    return columns.map((column) =>
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

  headerClassNameForColumn (column) {
    const classNames = ["live-table-header"]

    if (column.commonProps && column.commonProps.className) classNames.push(column.commonProps.className)
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

  submitFilter = () => {
    const {appHistory} = this.props
    const qParams = Params.serializeForm(this.refs.filterForm)
    const {queryQName} = this.state

    const changeParamsParams = {}
    changeParamsParams[queryQName] = JSON.stringify(qParams)

    Params.changeParams(changeParamsParams, {appHistory})
  }

  submitFilterDebounce = debounce(digg(this, "submitFilter"))
}))
