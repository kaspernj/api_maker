import React, {useMemo} from "react"
import {Pressable, View} from "react-native"
import apiMakerConfig from "@kaspernj/api-maker/build/config"
import BaseComponent from "../../base-component"
import classNames from "classnames"
import {digg} from "diggerize"
import memo from "set-state-compare/src/memo"
import {shapeComponent} from "set-state-compare/src/shape-component"
import models from "../../models"
import Params from "../../params"
import Text from "../../utils/text"
import useI18n from "i18n-on-steroids/src/use-i18n"

const {TableSearch} = models

const SearchLink = memo(shapeComponent(class SearchLink extends BaseComponent {
  render() {
    const {search} = this.props

    return (
      <View dataSet={{class: "search-row", searchId: search.id()}} style={{flexDirection: "row", width: "100%"}}>
        <Pressable dataSet={{class: "load-search-link"}} onPress={this.onSearchClicked} style={{justifyContent: "center"}}>
          <Text>
            {search.name()}
          </Text>
        </Pressable>
        <View style={{flexDirection: "row", marginLeft: "auto"}}>
          <Pressable
            dataSet={{class: "edit-search-button"}}
            onPress={this.onEditPressed}
            style={{
              alignItems: "center",
              justifyContent: "center",
              width: 25,
              height: 25,
              backgroundColor: "#fff",
              border: "1px solid #007bff",
              borderRadius: 5,
              color: "#007bff"
            }}
          >
            <Text>
              &#x270E;
            </Text>
          </Pressable>
          <Pressable
            dataSet={{class: "delete-search-button"}}
            onPress={this.onDeletePressed}
            style={{
              alignItems: "center",
              justifyContent: "center",
              marginLeft: 5,
              width: 25,
              height: 25,
              backgroundColor: "#fff",
              border: "1px solid #dc3545",
              borderRadius: 5,
              color: "#dc3545"
            }}
          >
            <Text>
              &#x2715;
            </Text>
          </Pressable>
        </View>
      </View>
    )
  }

  onDeletePressed = async () => {
    if (!confirm("Are you sure?")) {
      return
    }

    const {search} = this.props

    await search.destroy()
    this.props.onDeleted({search})
  }

  onEditPressed = () => this.props.onEditPressed({search: this.props.search})
  onSearchClicked = () => this.props.onClick({search: this.props.search})
}))

export default memo(shapeComponent(class ApiMakerTableFiltersLoadSearchModal extends BaseComponent {
  setup() {
    const {t} = useI18n({namespace: "js.api_maker.table.filters.load_search_modal"})

    this.useStates({
      editSearch: undefined,
      searches: undefined
    })
    this.setInstance({t})

    useMemo(() => {
      this.loadSearches()
    }, [])
  }

  loadSearches = async () => {
    const {currentUser} = this.props
    const userType = digg(currentUser.modelClassData(), "name")
    const searches = await TableSearch
      .ransack({user_id_eq: currentUser.id(), user_type_eq: userType})
      .toArray()

    this.setState({searches})
  }

  render() {
    const {t} = this
    const {className, currentUser, modelClass, onEditSearchPressed, onRequestClose, querySearchName, ...restProps} = this.props
    const Modal = apiMakerConfig.getModal()

    return (
      <Modal className={classNames("api-maker--table--filters--load-search-modal", className)} onRequestClose={onRequestClose} {...restProps}>
        <View>
          <Text>
            {t(".choose_a_search", {defaultValue: "Choose a search"})}
          </Text>
        </View>
        {this.state.searches?.map((search) =>
          <SearchLink key={search.id()} onClick={this.onSearchClicked} onDeleted={this.onSearchDeleted} onEditPressed={onEditSearchPressed} search={search} />
        )}
      </Modal>
    )
  }

  onSearchClicked = ({search}) => {
    const {onRequestClose, querySearchName} = this.props
    const queryParams = search.queryParams()
    const newParams = {}

    newParams[querySearchName] = queryParams.map((queryParam) => JSON.stringify(queryParam))

    Params.changeParams(newParams)

    onRequestClose()
  }

  onSearchDeleted = ({search}) => {
    this.setState({
      searches: this.state.searches.filter((existingSearch) => existingSearch.id() != search.id())
    })
  }
}))
