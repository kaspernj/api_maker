import {digg, digs} from "diggerize"
import FilterForm from "./filter-form"
import LoadSearchModal from "./load-search-modal"
import SaveSearchModal from "./save-search-modal"
import PropTypes from "prop-types"
import {memo} from "react"
import {shapeComponent, ShapeComponent} from "set-state-compare/src/shape-component.js"
import useI18n from "i18n-on-steroids/src/use-i18n.mjs"
import useQueryParams from "on-location-changed/src/use-query-params"

const ApiMakerTableFilter = memo(shapeComponent(class ApiMakerTableFilter extends ShapeComponent {
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
}))

export default memo(shapeComponent(class ApiMakerTableFilters extends ShapeComponent {
  static propTypes = {
    currentUser: PropTypes.object,
    modelClass: PropTypes.func.isRequired,
    queryName: PropTypes.string.isRequired,
    querySName: PropTypes.string.isRequired
  }

  setup() {
    const {t} = useI18n({namespace: "js.api_maker.table.filters"})

    this.queryParams = useQueryParams()
    this.t = t
    this.useStates({
      filter: undefined,
      showLoadSearchModal: false,
      showSaveSearchModal: false
    })
  }

  render() {
    const {modelClass, querySName} = digs(this.props, "modelClass", "querySName")
    const {currentUser} = this.props
    const {filter, showLoadSearchModal, showSaveSearchModal} = digs(this.state, "filter", "showLoadSearchModal", "showSaveSearchModal")
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
          <SaveSearchModal
            currentFilters={digg(this, "currentFilters")}
            currentUser={currentUser}
            onRequestClose={digg(this, "onRequestCloseSaveSearchModal")}
          />
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
            {this.t(".add_new_filter", {defaultValue: "Add new filter"})}
          </button>
          {currentUser &&
            <>
              <button className="save-search-button" onClick={digg(this, "onSaveSearchClicked")}>
                {this.t(".save_search", {defaultValue: "Save search"})}
              </button>
              <button className="load-search-button" onClick={digg(this, "onLoadSearchClicked")}>
                {this.t(".load_search", {defaultValue: "Load search"})}
              </button>
            </>
          }
        </div>
      </div>
    )
  }

  currentFilters = () => {
    const {querySName} = digs(this.props, "querySName")
    const currentFilters = this.queryParams[querySName] || []

    return currentFilters.map((currentFilter) => JSON.parse(currentFilter))
  }

  onAddFilterClicked = (e) => {
    e.preventDefault()

    const newFilterIndex = this.currentFilters().length

    this.setState({
      filter: {
        filterIndex: newFilterIndex
      }
    })
  }

  onApplyClicked = () => this.setState({filter: undefined})
  onFilterClicked = (args) => this.setState({filter: args})

  onLoadSearchClicked = (e) => {
    e.preventDefault()
    this.setState({
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

    this.setState({
      filter: undefined
    })
  }

  onRequestCloseLoadSearchModal = () => this.setState({showLoadSearchModal: false})
  onRequestCloseSaveSearchModal = () => this.setState({showSaveSearchModal: false})

  onSaveSearchClicked = (e) => {
    e.preventDefault()

    if (this.hasAnyFilters()) {
      this.setState({showSaveSearchModal: true})
    } else {
      FlashMessage.alert(this.t(".no_filters_has_been_set", {defaultValue: "No filters has been set"}))
    }
  }

  hasAnyFilters = () => Object.keys(this.currentFilters()).length > 0
}))
