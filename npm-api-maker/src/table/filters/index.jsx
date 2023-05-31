import {digg, digs} from "diggerize"
import PropTypes from "prop-types"
import React from "react"
import FilterForm from "./filter-form"
import Shape from "set-state-compare/src/shape"
import withQueryParams from "on-location-changed/src/with-query-params"

class ApiMakerTableFilter extends React.PureComponent {
  static propTypes = {
    a: PropTypes.string.isRequired,
    filterIndex: PropTypes.number.isRequired,
    onClick: PropTypes.func.isRequired,
    onRemoveClicked: PropTypes.func.isRequired,
    p: PropTypes.array.isRequired,
    pre: PropTypes.string.isRequired,
    v: PropTypes.string.isRequired
  }

  render() {
    const {p, v} = digs(this.props, "p", "v")
    const {a, pre, sc} = this.props

    return (
      <div style={{display: "inline-block", backgroundColor: "grey", padding: "10px 6px"}}>
        <span className="filter-label" onClick={digg(this, "onFilterClicked")} style={{cursor: "pointer"}}>
          {p.length > 0 &&
            `${p.join(".")}.`
          }
          {a} {sc} {pre} {v}
        </span>
        <span>
          <a className="remove-filter-button" href="#" onClick={digg(this, "onRemoveFilterClicked")}>
            <i className="fa fa-remove la la-remove" />
          </a>
        </span>
      </div>
    )
  }

  onFilterClicked = (e) => {
    e.preventDefault()

    const {a, filterIndex, p, pre, v} = digs(this.props, "a", "filterIndex", "p", "pre", "v")

    this.props.onClick({a, filterIndex, p, pre, v})
  }

  onRemoveFilterClicked = (e) => {
    e.preventDefault()

    const {filterIndex} = digs(this.props, "filterIndex")

    this.props.onRemoveClicked({filterIndex})
  }
}

class ApiMakerTableFilters extends React.PureComponent {
  static propTypes = {
    modelClass: PropTypes.func.isRequired,
    queryName: PropTypes.string.isRequired,
    querySName: PropTypes.string.isRequired,
    queryParams: PropTypes.object.isRequired
  }

  shape = new Shape(this, {
    filter: undefined
  })

  render() {
    const {modelClass, querySName} = digs(this.props, "modelClass", "querySName")
    const {filter} = digs(this.shape, "filter")
    const currentFilters = this.currentFilters()

    return (
      <div className="api-maker--table--filters">
        <button className="add-new-filter-button" onClick={digg(this, "onAddFilterClicked")}>
          {I18n.t("js.api_maker.table.filters.add_new_filter", {defaultValue: "Add new filter"})}
        </button>
        {filter &&
          <FilterForm
            filter={filter}
            key={`filter-${filter.filterIndex}`}
            modelClass={modelClass}
            onApplyClicked={digg(this, "onApplyClicked")}
            querySearchName={querySName}
          />
        }
        {currentFilters?.map((filterData, filterIndex) =>
          <ApiMakerTableFilter
            key={filterIndex}
            filterIndex={filterIndex}
            onClick={digg(this, "onFilterClicked")}
            onRemoveClicked={digg(this, "onRemoveClicked")}
            {...JSON.parse(filterData)}
          />
        )}
      </div>
    )
  }

  currentFilters() {
    const {queryParams, querySName} = digs(this.props, "queryParams", "querySName")
    const currentFilters = queryParams[querySName] || []

    return currentFilters
  }

  onAddFilterClicked = (e) => {
    e.preventDefault()

    const newFilterIndex = this.currentFilters().length

    this.shape.set({
      filter: {
        filterIndex: newFilterIndex
      }
    })
  }

  onApplyClicked = () => this.shape.set({filter: undefined})

  onRemoveClicked = ({filterIndex}) => {
    const {querySName} = digs(this.props, "querySName")
    const searchParams = Params.parse()[querySName] || {}

    delete searchParams[filterIndex]

    const newParams = {}

    newParams[querySName] = searchParams

    Params.changeParams(newParams)

    this.shape.set({
      filter: undefined
    })
  }

  onFilterClicked = (args) => this.shape.set({filter: args})
}

export default withQueryParams(ApiMakerTableFilters)
