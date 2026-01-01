import React, {useRef} from "react"
import BaseComponent from "../../base-component.js"
import columnIdentifier from "../column-identifier.js"
import ColumnRow from "./column-row.js"
import DownloadAction from "./download-action.js"
import memo from "set-state-compare/build/memo.js"
import Modal from "../../modal.js"
import PropTypes from "prop-types"
import propTypesExact from "prop-types-exact"
import {shapeComponent} from "set-state-compare/build/shape-component.js"
import {View} from "react-native"
import Text from "../../utils/text.js"
import useI18n from "i18n-on-steroids/src/use-i18n.mjs"

export default memo(shapeComponent(class ApiMakerTableSettings extends BaseComponent {
  static propTypes = propTypesExact({
    onRequestClose: PropTypes.func.isRequired,
    table: PropTypes.object.isRequired
  })

  setup() {
    const {l, t} = useI18n({namespace: "js.api_maker.table.settings"})

    this.rootRef = useRef()
    this.l = l
    this.t = t
  }

  tableSetting = () => this.p.table.s.tableSetting

  render() {
    const {l, t} = this.tt
    const {table} = this.p
    const {preparedColumns} = table.s

    return (
      <Modal onBackdropPress={this.p.onRequestClose} onRequestClose={this.p.onRequestClose} style={this.cache("rootModalStyle", {backgroundColor: "#000"})} transparent>
        <View
          dataSet={this.cache("rootViewDataSet", {class: "api-maker--table--settings"})}
          style={this.cache("rootViewStyle", {
            width: "100%",
            maxWidth: 800,
            padding: 20,
            backgroundColor: "#fff",
            border: "1px solid black"
          })}
        >
          <View style={this.cache("settingsHeaderViewStyle", {marginBottom: 5})}>
            <Text style={this.cache("settingsHeaderTextSTyle", {fontSize: 16, fontWeight: "bold"})}>
              {t(".settings", {defaultValue: "Settings"})}
            </Text>
          </View>
          <DownloadAction l={l} table={table} />
          <View style={this.cache("columnsHeaderViewStyle", {marginBottom: 5})}>
            <Text style={this.cache("columnsHeaderTextStyle", {fontSize: 16, fontWeight: "bold"})}>
              {t(".columns", {defaultValue: "Columns"})}
            </Text>
          </View>
          {preparedColumns?.map(({column, tableSettingColumn}) =>
            <ColumnRow column={column} key={columnIdentifier(column)} table={table} tableSettingColumn={tableSettingColumn} />
          )}
        </View>
      </Modal>
    )
  }
}))
