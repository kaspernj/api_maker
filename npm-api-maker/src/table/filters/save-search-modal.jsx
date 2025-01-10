import apiMakerConfig from "@kaspernj/api-maker/build/config"
import BaseComponent from "../../base-component"
import Checkbox from "../../bootstrap/checkbox"
import {digg} from "diggerize"
import FlashMessage from "../../flash-message"
import {Form} from "../../form"
import Input from "../../bootstrap/input"
import modelClassRequire from "../../model-class-require"
import React from "react"
import {shapeComponent} from "set-state-compare/src/shape-component"
import memo from "set-state-compare/src/memo"
import useI18n from "i18n-on-steroids/src/use-i18n"

const TableSearch = modelClassRequire("TableSearch")

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
    const hasUserTypeColumn = Boolean(TableSearch.attributes().find((attribute) => attribute.name() == "user_type"))

    if (search.isNewRecord()) {
      formData.table_search.query_params = JSON.stringify(currentFilters())
    }

    if (hasUserTypeColumn) {
      formData.table_search.user_type = digg(currentUser.modelClassData(), "className")
    }

    formData.table_search.user_id = currentUser.id()

    try {
      await search.saveRaw(formData)
      FlashMessage.success(this.t(".", {defaultValue: "The search was saved."}))
      onRequestClose()
    } catch (error) {
      FlashMessage.errorResponse(error)
    }
  }
}))
