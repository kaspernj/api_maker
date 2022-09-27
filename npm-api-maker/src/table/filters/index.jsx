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
    p: PropTypes.array.isRequired,
    pre: PropTypes.string.isRequired,
    v: PropTypes.string.isRequired
  }

  render() {
    const {a, p, pre, v} = digs(this.props, "a", "p", "pre", "v")

    return (
      <div onClick={digg(this, "onFilterClicked")} style={{display: "inline-block", backgroundColor: "grey", padding: "10px 6px"}}>
        {p.join(".")}.{a} {pre} {v}
      </div>
    )
  }

  onFilterClicked = (e) => {
    e.preventDefault()

    const {a, filterIndex, p, pre, v} = digs(this.props, "a", "filterIndex", "p", "pre", "v")

    this.props.onClick({a, filterIndex, p, pre, v})
  }
}

class ApiMakerTableFilters extends React.PureComponent {
  static propTypes = {
    modelClass: PropTypes.func.isRequired,
    queryName: PropTypes.string.isRequired,
    queryParams: PropTypes.object.isRequired
  }

  shape = new Shape(this, {
    filter: undefined
  })

  render() {
    const {modelClass} = this.props
    const {filter} = digs(this.shape, "filter")
    const currentFilters = this.currentFilters()

    return (
      <div className="api-maker--table--filters--edit">
        <button onClick={digg(this, "onAddFilterClicked")}>
          {I18n.t("js.api_maker.table.filters.add_new_filter", {defaultValue: "Add new filter"})}
        </button>
        {filter &&
          <FilterForm
            filter={filter}
            key={`filter-${filter.filterIndex}`}
            modelClass={modelClass}
            querySearchName={this.querySearchName()}
          />
        }
        {currentFilters?.map((filterData, filterIndex) =>
          <ApiMakerTableFilter key={filterIndex} filterIndex={filterIndex} onClick={digg(this, "onFilterClicked")} {...JSON.parse(filterData)} />
        )}
      </div>
    )
  }

  currentFilters() {
    const {queryParams} = this.props
    const currentFilters = queryParams[this.querySearchName()] || []

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

  onFilterClicked = (args) => this.shape.set({filter: args})
  querySearchName = () => `${this.props.queryName}_s`
}

export default withQueryParams(ApiMakerTableFilters)
