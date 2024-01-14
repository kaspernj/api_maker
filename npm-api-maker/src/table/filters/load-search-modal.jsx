import apiMakerConfig from "@kaspernj/api-maker/src/config.mjs"
import classNames from "classnames"
import {digg} from "diggerize"
import {TableSearch} from "../../models.mjs.erb"
import {useEffect} from "react"

const SearchLink = (props) => {
  const {onClick, search} = props
  const onSearchClicked = useCallback((e) => {
    e.preventDefault()
    onClick({search})
  })

  return (
    <a href="#" key={search.id()} onClick={onSearchClicked} style={{display: "block"}}>
      {search.name()}
    </a>
  )
}

const ApiMakerTableFiltersLoadSearchModal = (props) => {
  const {className, currentUser, modelClass, onRequestClose, querySearchName, ...restProps} = props
  const Modal = apiMakerConfig.getModal()
  const [searches, setSearches] = useState(undefined)

  const loadSearches = async () => {
    const userType = digg(currentUser.modelClassData(), "name")
    const searches = await TableSearch
      .ransack({user_id_eq: currentUser.id(), user_type_eq: userType})
      .toArray()

    setSearches(searches)
  }

  const onSearchClicked = useCallback(({search}) => {
    const queryParams = search.queryParams()
    const newParams = {}

    newParams[querySearchName] = queryParams.map((queryParam) => JSON.stringify(queryParam))

    Params.changeParams(newParams)

    onRequestClose()
  })

  useEffect(() => { loadSearches() }, [])

  return (
    <Modal className={classNames("api-maker--table--filters--load-search-modal", className)} onRequestClose={onRequestClose} {...restProps}>
      <div>
        {I18n.t("js.api_maker.table.filters.load_search_modal.choose_a_search", {defaultValue: "Choose a search"})}
      </div>
      {searches?.map((search) =>
        <SearchLink key={search.id()} onClick={onSearchClicked} search={search} />
      )}
    </Modal>
  )
}

export default ApiMakerTableFiltersLoadSearchModal
