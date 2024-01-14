import {digg, digs} from "diggerize"
import FilterForm from "./filter-form"
import LoadSearchModal from "./load-search-modal"
import SaveSearchModal from "./save-search-modal"
import PropTypes from "prop-types"
import React from "react"
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
    currentUser: PropTypes.object,
    modelClass: PropTypes.func.isRequired,
    queryName: PropTypes.string.isRequired,
    querySName: PropTypes.string.isRequired,
    queryParams: PropTypes.object.isRequired
  }

  shape = new Shape(this, {
    filter: undefined,
    showLoadSearchModal: false,
    showSaveSearchModal: false
  })

  render() {
    const {modelClass, querySName} = digs(this.props, "modelClass", "querySName")
    const {currentUser} = this.props
    const {filter, showLoadSearchModal, showSaveSearchModal} = digs(this.shape, "filter", "showLoadSearchModal", "showSaveSearchModal")
    const currentFilters = this.currentFilters()

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
        {showLoadSearchModal &&
          <LoadSearchModal
            currentUser={currentUser}
            modelClass={modelClass}
            onRequestClose={digg(this, "onRequestCloseLoadSearchModal")}
            querySearchName={querySName}
          />
        }
        {showSaveSearchModal &&
          <SaveSearchModal currentFilters={digg(this, "currentFilters")} currentUser={currentUser} onRequestClose={digg(this, "onRequestCloseSaveSearchModal")} />
        }
        {currentFilters?.map((filterData, filterIndex) =>
          <ApiMakerTableFilter
            key={filterIndex}
            filterIndex={filterIndex}
            onClick={digg(this, "onFilterClicked")}
            onRemoveClicked={digg(this, "onRemoveClicked")}
            {...filterData}
          />
        )}
        <div className="filter-actions">
          <button className="add-new-filter-button" onClick={digg(this, "onAddFilterClicked")}>
            {I18n.t("js.api_maker.table.filters.add_new_filter", {defaultValue: "Add new filter"})}
          </button>
          {currentUser &&
            <>
              <button className="save-search-button" onClick={digg(this, "onSaveSearchClicked")}>
                {I18n.t("js.api_maker.table.filters.save_search", {defaultValue: "Save search"})}
              </button>
              <button className="load-search-button" onClick={digg(this, "onLoadSearchClicked")}>
                {I18n.t("js.api_maker.table.filters.load_search", {defaultValue: "Load search"})}
              </button>
            </>
          }
        </div>
      </div>
    )
  }

  currentFilters = () => {
    const {queryParams, querySName} = digs(this.props, "queryParams", "querySName")
    const currentFilters = queryParams[querySName] || []

    return currentFilters.map((currentFilter) => JSON.parse(currentFilter))
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

  onLoadSearchClicked = (e) => {
    e.preventDefault()
    this.shape.set({
      showLoadSearchModal: true
    })
  }

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

  onRequestCloseLoadSearchModal = () => this.shape.set({showLoadSearchModal: false})
  onRequestCloseSaveSearchModal = () => this.shape.set({showSaveSearchModal: false})

  onSaveSearchClicked = (e) => {
    e.preventDefault()

    if (this.hasAnyFilters()) {
      this.shape.set({showSaveSearchModal: true})
    } else {
      FlashMessage.alert(I18n.t("js.api_maker.table.filters.no_filters_has_been_set", {defaultValue: "No filters has been set"}))
    }
  }

  hasAnyFilters = () => Object.keys(this.currentFilters()).length > 0
}

export default withQueryParams(ApiMakerTableFilters)
