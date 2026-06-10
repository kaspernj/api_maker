// @ts-check
/* eslint-disable sort-imports, react/jsx-max-depth */
import {ShapeComponent, shapeComponent} from "set-state-compare/build/shape-component.js"
import apiMakerConfig from "../config.js"
import Button from "../utils/button"
import memo from "set-state-compare/build/memo.js"
import PropTypes from "prop-types"
import propTypesExact from "prop-types-exact"
import React from "react"
import Text from "../utils/text"
import useI18n from "i18n-on-steroids/build/src/use-i18n.js"
import {View} from "react-native"

/**
 * Confirmation shown when a user tries to load more rows than the configured dangerous threshold (e.g. the
 * "All" per-page option on a very large collection). Warns that the load may freeze the browser, advises
 * filtering, points to the existing Download export, and lets the user proceed or cancel.
 *
 * @typedef {object} Props
 * @property {number} count
 * @property {() => void} onConfirm
 * @property {() => void} onRequestClose
 */
export default memo(shapeComponent(/** @augments {ShapeComponent<Props>} */ class ApiMakerTableLargePerPageWarningModal extends ShapeComponent {
  static propTypes = propTypesExact({
    count: PropTypes.number,
    onConfirm: PropTypes.func.isRequired,
    onRequestClose: PropTypes.func.isRequired
  })

  setup() {
    const {t} = useI18n({namespace: "js.api_maker.table.large_per_page_warning_modal"})

    this.t = t
  }

  render() {
    const {count, onConfirm, onRequestClose, ...restProps} = this.p
    const Modal = apiMakerConfig.getModal()
    const warningDefault = "You're about to load %{count} rows. " +
      "This can make the page very slow or even crash your browser."
    const exportDefault = "To save the data as a file, open the table settings (the gear icon) and click " +
      "Download — it saves the rows currently shown."

    return (
      <Modal onRequestClose={onRequestClose} {...restProps}>
        <View
          dataSet={this.cache("rootViewDataSet", {class: "large-per-page-warning-modal"})}
          style={this.cache("rootViewStyle", {padding: 20})}
          testID="large-per-page-warning-modal"
        >
          <Text style={this.cache("titleStyle", {fontSize: 18, fontWeight: "bold", marginBottom: 12})}>
            {this.t(".title", {defaultValue: "Load a large number of rows?"})}
          </Text>
          <Text style={this.cache("warningStyle", {marginBottom: 8})}>
            {this.t(".warning", {count, defaultValue: warningDefault})}
          </Text>
          <Text style={this.cache("filterAdviceStyle", {marginBottom: 8})}>
            {this.t(".filter_advice", {defaultValue: "Consider narrowing your results with filters first."})}
          </Text>
          <Text style={this.cache("exportAdviceStyle", {marginBottom: 16})}>
            {this.t(".export_advice", {defaultValue: exportDefault})}
          </Text>
          <View style={this.cache("buttonsViewStyle", {flexDirection: "row", justifyContent: "flex-end"})}>
            <Button
              label={this.t(".cancel", {defaultValue: "Cancel"})}
              onPress={onRequestClose}
              pressableProps={this.cache("cancelButtonProps", {testID: "large-per-page-cancel-button"})}
            />
            <View style={this.cache("buttonSpacerStyle", {width: 10})} />
            <Button
              danger
              label={this.t(".proceed_anyway", {defaultValue: "Proceed anyway"})}
              onPress={onConfirm}
              pressableProps={this.cache("proceedButtonProps", {testID: "large-per-page-proceed-button"})}
            />
          </View>
        </View>
      </Modal>
    )
  }
}))
