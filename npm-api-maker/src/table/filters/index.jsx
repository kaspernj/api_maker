import BaseComponent from "../../base-component.js"
import {digg, digs} from "diggerize"
import Filter from "./filter"
import FilterForm from "./filter-form"
import {FlashNotifications} from "flash-notifications"
import LoadSearchModal from "./load-search-modal"
import SaveSearchModal from "./save-search-modal"
import Params from "../../params.js"
import PropTypes from "prop-types"
// @ts-ignore
import {TableSearch} from "models.js"
import memo from "set-state-compare/build/memo.js"
import {shapeComponent} from "set-state-compare/build/shape-component.js"
import React from "react"
import useI18n from "i18n-on-steroids/src/use-i18n.mjs"
import useQueryParams from "on-location-changed/build/use-query-params.js"
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
      <View dataSet={this.cache("rootViewDataSet", {class: "api-maker--table--filters"})} style={this.cache("rootViewStyle", {alignItems: "flex-start"})}>
        {filter &&
          <FilterForm
            filter={filter}
            key={`filter-${filter.filterIndex}`}
            modelClass={modelClass}
            onApplyClicked={this.tt.onApplyClicked}
            onRequestClose={this.tt.onFilterFormRequestClose}
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
        <View dataSet={this.cache("filterActionsDataSet", {class: "filter-actions"})} style={this.cache("filterActionsStyle", {flexDirection: "row", marginTop: 10})}>
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

  onFilterClicked = (filter) => this.setState({filter})
  onFilterFormRequestClose = () => this.setState({filter: undefined})

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
      FlashNotifications.alert(this.t(".no_filters_has_been_set", {defaultValue: "No filters has been set"}))
    }
  }

  hasAnyFilters = () => Object.keys(this.currentFilters()).length > 0
}))
