import apiMakerConfig from "@kaspernj/api-maker/src/config.mjs"
import classNames from "classnames"
import {digg} from "diggerize"
import {memo, useEffect} from "react"
import {shapeComponent, ShapeComponent} from "set-state-compare/src/shape-component.js"
import {TableSearch} from "../../models.mjs.erb"
import {Pressable, Text, View} from "react-native"

const SearchLink = memo(shapeComponent(class SearchLink extends ShapeComponent {
  render() {
    const {search} = this.props

    return (
      <View>
        <Pressable dataSet={{class: "load-search-link"}} onPress={this.onSearchClicked}>
          <Text>
            {search.name()}
          </Text>
        </Pressable>
        <Pressable dataSet={{class: "edit-search-link"}} onPress={this.onEditPressed}>
          <Text>
            edit
          </Text>
        </Pressable>
      </View>
    )
  }

  onEditPressed = () => this.props.onEditPressed({search: this.props.search})
  onSearchClicked = () => this.props.onClick({search})
}))

export default memo(shapeComponent(class ApiMakerTableFiltersLoadSearchModal extends ShapeComponent {
  setup() {
    this.useStates({
      editSearch: undefined,
      searches: undefined
    })

    useEffect(() => {
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
    const {className, currentUser, modelClass, onEditSearchPressed, onRequestClose, querySearchName, ...restProps} = this.props
    const Modal = apiMakerConfig.getModal()

    return (
      <Modal className={classNames("api-maker--table--filters--load-search-modal", className)} onRequestClose={onRequestClose} {...restProps}>
        <div>
          {I18n.t("js.api_maker.table.filters.load_search_modal.choose_a_search", {defaultValue: "Choose a search"})}
        </div>
        {this.state.searches?.map((search) =>
          <SearchLink key={search.id()} onClick={this.onSearchClicked} onEditPressed={onEditSearchPressed} search={search} />
        )}
      </Modal>
    )
  }

  onSearchClicked = ({search}) => {
    const queryParams = search.queryParams()
    const newParams = {}

    newParams[querySearchName] = queryParams.map((queryParam) => JSON.stringify(queryParam))

    Params.changeParams(newParams)

    onRequestClose()
  }
}))
