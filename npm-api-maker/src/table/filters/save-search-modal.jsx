import apiMakerConfig from "@kaspernj/api-maker/src/config.mjs"
import {digg} from "diggerize"
import Input from "../../bootstrap/input"
import {TableSearch} from "../../models.mjs.erb"
import {useCallback} from "react"

const ApiMakerTableFiltersSaveSearchModal = (props) => {
  const {currentFilters, currentUser, onRequestClose, ...restProps} = props
  const Modal = apiMakerConfig.getModal()

  const onSaveSearchSubmit = useCallback(async (e) => {
    e.preventDefault()

    const form = digg(e, "target")
    const formData = new FormData(form)
    const tableSearch = new TableSearch()

    formData.append("table_search[query_params]", JSON.stringify(currentFilters()))
    formData.append("table_search[user_type]", digg(currentUser.modelClassData(), "className"))
    formData.append("table_search[user_id]", currentUser.id())

    try {
      await tableSearch.saveRaw(formData, {form})
      onRequestClose()
    } catch (error) {
      FlashMessage.errorResponse(error)
    }
  })

  return (
    <Modal onRequestClose={onRequestClose} {...restProps}>
      <form onSubmit={onSaveSearchSubmit}>
        <Input
          id="table_search_name"
          label={I18n.t("js.api_maker.table.filters.search_name", {defaultValue: "Search name"})}
          name="table_search[name]"
        />
        <button className="save-search-submit-button">
          {I18n.t("js.api_maker.table.filters.save", {defaultValue: "Save"})}
        </button>
      </form>
    </Modal>
  )
}

export default ApiMakerTableFiltersSaveSearchModal
