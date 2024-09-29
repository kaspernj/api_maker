import apiMakerConfig from "@kaspernj/api-maker/src/config.mjs"
import BaseComponent from "../../base-component"
import Checkbox from "../../bootstrap/checkbox"
import {digg} from "diggerize"
import {Form} from "../../form"
import Input from "../../bootstrap/input"
import {shapeComponent} from "set-state-compare/src/shape-component.js"
import {memo} from "react"
import useI18n from "i18n-on-steroids/src/use-i18n.mjs"

export default memo(shapeComponent(class ApiMakerTableFiltersSaveSearchModal extends BaseComponent {
  setup() {
    const {t} = useI18n({namespace: "js.api_maker.table.filters.save_search_modal"})

    this.t = t
    this.useStates({form: null})
  }

  render() {
    const {currentFilters, currentUser, onRequestClose, search, ...restProps} = this.props
    const Modal = apiMakerConfig.getModal()

    return (
      <Modal onRequestClose={onRequestClose} {...restProps}>
        <Form onSubmit={this.tt.onSaveSearchSubmit} setForm={this.setStates.form}>
          <Input
            defaultValue={search.name()}
            id="table_search_name"
            label={this.t(".search_name", {defaultValue: "Search name"})}
            name="table_search[name]"
          />
          <Checkbox
            defaultChecked={search.public()}
            id="table_search_public"
            label={this.t(".public", {defaultValue: "Public"})}
            name="table_search[public]"
          />
          <button className="save-search-submit-button">
            {this.t(".save_search", {defaultValue: "Save search"})}
          </button>
        </Form>
      </Modal>
    )
  }

  onSaveSearchSubmit = async () => {
    const formData = this.s.form.asObject()
    const {currentFilters, currentUser, onRequestClose, search} = this.p

    if (search.isNewRecord()) {
      formData.append("table_search[query_params]", JSON.stringify(currentFilters()))
    }

    formData.append("table_search[user_type]", digg(currentUser.modelClassData(), "className"))
    formData.append("table_search[user_id]", currentUser.id())

    try {
      await search.saveRaw(formData)
      onRequestClose()
    } catch (error) {
      FlashMessage.errorResponse(error)
    }
  }
}))
