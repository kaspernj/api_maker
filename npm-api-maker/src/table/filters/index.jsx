import apiMakerConfig from "@kaspernj/api-maker/src/config.mjs"
import {digg, digs} from "diggerize"
import Input from "../../bootstrap/input"
import FilterForm from "./filter-form"
import PropTypes from "prop-types"
import React from "react"
import Shape from "set-state-compare/src/shape"
import {TableSearch} from "../../models.mjs.erb"
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
    filter: undefined,
    showSaveSearchModal: false
  })

  render() {
    const {modelClass, querySName} = digs(this.props, "modelClass", "querySName")
    const {filter, showSaveSearchModal} = digs(this.shape, "filter", "showSaveSearchModal")
    const currentFilters = this.currentFilters()
    const Modal = apiMakerConfig.getModal()

    return (
      <div className="api-maker--table--filters">
        {filter &&
          <FilterForm
            filter={filter}
            key={`filter-${filter.filterIndex}`}
            modelClass={modelClass}
            onApplyClicked={digg(this, "onApplyClicked")}
            querySearchName={querySName}
          />
        }
        {showSaveSearchModal &&
          <Modal onRequestClose={digg(this, "onRequestCloseSaveSearchModal")}>
            <form onSubmit={digg(this, "onSaveSearchSubmit")}>
              <Input
                label={I18n.t("js.api_maker.table.filters.search_name", {defaultValue: "Search name"})}
                name="table_search[name]"
              />
              <button className="save-search-submit-button">
                {I18n.t("js.api_maker.table.filters.save", {defaultValue: "Save"})}
              </button>
            </form>
          </Modal>
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
        <div className="filter-actions">
          <button className="add-new-filter-button" onClick={digg(this, "onAddFilterClicked")}>
            {I18n.t("js.api_maker.table.filters.add_new_filter", {defaultValue: "Add new filter"})}
          </button>
          <button className="save-search-button" onClick={digg(this, "onSaveSearchClicked")}>
            {I18n.t("js.api_maker.table.filters.save_search", {defaultValue: "Save search"})}
          </button>
        </div>
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
  onFilterClicked = (args) => this.shape.set({filter: args})

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

  onRequestCloseSaveSearchModal = () => this.shape.set({showSaveSearchModal: false})

  onSaveSearchClicked = (e) => {
    e.preventDefault()
    this.shape.set({showSaveSearchModal: true})
  }

  onSaveSearchSubmit = async (e) => {
    e.preventDefault()

    const form = digg(e, "target")
    const formData = new FormData(form)
    const currentFilters = this.currentFilters()
    const tableSearch = new TableSearch()

    formData.append("table_search[query_params]", JSON.stringify(currentFilters))

    try {
      await tableSearch.saveRaw(formData, {form})
      this.shape.set({showSaveSearchModal: false})
    } catch (error) {
      FlashMessage.errorResponse(error)
    }
  }
}

export default withQueryParams(ApiMakerTableFilters)
