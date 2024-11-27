import BaseComponent from "../../base-component"
import {digg, digs} from "diggerize"
import Filter from "./filter"
import FilterForm from "./filter-form"
import LoadSearchModal from "./load-search-modal"
import SaveSearchModal from "./save-search-modal"
import PropTypes from "prop-types"
import memo from "set-state-compare/src/memo"
import {shapeComponent} from "set-state-compare/src/shape-component.js"
import {TableSearch} from "../../models.mjs.erb"
import useI18n from "i18n-on-steroids/src/use-i18n.mjs"
import useQueryParams from "on-location-changed/src/use-query-params"
import {View} from "react-native"

export default memo(shapeComponent(class ApiMakerTableFilters extends BaseComponent {
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
      showLoadSearchModal: undefined,
      showSaveSearchModal: false
    })
  }

  render() {
    const {modelClass, querySName} = digs(this.props, "modelClass", "querySName")
    const {currentUser} = this.props
    const {filter, showLoadSearchModal, showSaveSearchModal} = digs(this.state, "filter", "showLoadSearchModal", "showSaveSearchModal")
    const currentFilters = this.currentFilters()

    return (
      <View dataSet={{class: "api-maker--table--filters"}} style={{alignItems: "flex-start"}}>
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
            onEditSearchPressed={digg(this, "onEditSearchPressed")}
            onRequestClose={digg(this, "onRequestCloseLoadSearchModal")}
            querySearchName={querySName}
          />
        }
        {showSaveSearchModal &&
          <SaveSearchModal
            currentFilters={digg(this, "currentFilters")}
            currentUser={currentUser}
            onRequestClose={digg(this, "onRequestCloseSaveSearchModal")}
            search={showSaveSearchModal}
          />
        }
        {currentFilters?.map((filterData, filterIndex) =>
          <Filter
            key={filterIndex}
            filterIndex={filterIndex}
            onClick={this.tt.onFilterClicked}
            onRemoveClicked={this.tt.onRemoveClicked}
            {...filterData}
          />
        )}
        <View className="filter-actions" style={{flexDirection: "row", marginTop: 10}}>
          <button className="add-new-filter-button" onClick={this.tt.onAddFilterClicked}>
            {this.t(".add_new_filter", {defaultValue: "Add new filter"})}
          </button>
          {currentUser &&
            <>
              <button className="save-search-button" onClick={this.tt.onSaveSearchClicked} style={{marginLeft: 10}}>
                {this.t(".save_search", {defaultValue: "Save search"})}
              </button>
              <button className="load-search-button" onClick={this.tt.onLoadSearchClicked} style={{marginLeft: 10}}>
                {this.t(".load_search", {defaultValue: "Load search"})}
              </button>
            </>
          }
        </View>
      </View>
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

  onEditSearchPressed = ({search}) => {
    this.onRequestCloseLoadSearchModal()
    this.setState({
      showSaveSearchModal: search
    })
  }

  onFilterClicked = (args) => {
    console.log("onFilterClicked", {args})

    this.setState({filter: args})
  }

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
  onRequestCloseSaveSearchModal = () => this.setState({showSaveSearchModal: undefined})

  onSaveSearchClicked = (e) => {
    e.preventDefault()

    if (this.hasAnyFilters()) {
      this.setState({showSaveSearchModal: new TableSearch()})
    } else {
      FlashMessage.alert(this.t(".no_filters_has_been_set", {defaultValue: "No filters has been set"}))
    }
  }

  hasAnyFilters = () => Object.keys(this.currentFilters()).length > 0
}))
