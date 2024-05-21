import apiMakerConfig from "@kaspernj/api-maker/src/config.mjs"
import Checkbox from "@kaspernj/api-maker/src/bootstrap/checkbox"
import {digg} from "diggerize"
import Input from "../../bootstrap/input"
import {shapeComponent, ShapeComponent} from "set-state-compare/src/shape-component.js"
import {TableSearch} from "../../models.mjs.erb"
import {memo} from "react"
import useI18n from "i18n-on-steroids/src/use-i18n.mjs"

export default memo(shapeComponent(class ApiMakerTableFiltersSaveSearchModal extends ShapeComponent {
  setup() {
    const {t} = useI18n({namespace: "js.api_maker.table.filters.save_search_modal"})

    this.t = t
  }

  render() {
    const {currentFilters, currentUser, onRequestClose, ...restProps} = this.props
    const Modal = apiMakerConfig.getModal()

    return (
      <Modal onRequestClose={onRequestClose} {...restProps}>
        <form onSubmit={this.onSaveSearchSubmit}>
          <Input
            id="table_search_name"
            label={this.t(".search_name", {defaultValue: "Search name"})}
            name="table_search[name]"
          />
          <Checkbox
            id="table_search_public"
            label={this.t(".public", {defaultValue: "Public"})}
            name="table_search[public]"
          />
          <button className="save-search-submit-button">
            {this.t(".save_search", {defaultValue: "Save search"})}
          </button>
        </form>
      </Modal>
    )
  }

  onSaveSearchSubmit = async (e) => {
    e.preventDefault()

    const form = digg(e, "target")
    const formData = new FormData(form)
    const tableSearch = new TableSearch()

    formData.append("table_search[query_params]", JSON.stringify(this.props.currentFilters()))
    formData.append("table_search[user_type]", digg(this.props.currentUser.modelClassData(), "className"))
    formData.append("table_search[user_id]", this.props.currentUser.id())

    try {
      await tableSearch.saveRaw(formData, {form})
      this.props.onRequestClose()
    } catch (error) {
      FlashMessage.errorResponse(error)
    }
  }
}))
