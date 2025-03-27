import React, {useRef} from "react"
import BaseComponent from "../../base-component"
import columnIdentifier from "../column-identifier"
import ColumnRow from "./column-row"
import DownloadAction from "./download-action"
import memo from "set-state-compare/src/memo"
import Modal from "../../modal"
import PropTypes from "prop-types"
import propTypesExact from "prop-types-exact"
import {shapeComponent} from "set-state-compare/src/shape-component"
import {View} from "react-native"
import Text from "../../utils/text"
import useI18n from "i18n-on-steroids/src/use-i18n"

export default memo(shapeComponent(class ApiMakerTableSettings extends BaseComponent {
  static propTypes = propTypesExact({
    onRequestClose: PropTypes.func.isRequired,
    table: PropTypes.object.isRequired
  })

  setup() {
    const {t} = useI18n({namespace: "js.api_maker.table.settings"})

    this.rootRef = useRef()
    this.t = t
  }

  tableSetting = () => this.p.table.s.tableSetting

  render() {
    const {t} = this.tt
    const {table} = this.p
    const {preparedColumns} = table.s

    return (
      <Modal onBackdropPress={this.p.onRequestClose} onRequestClose={this.p.onRequestClose} style={this.rootModalStyle ||= {backgroundColor: "#000"}} transparent>
        <View
          dataSet={this.rootViewDataSet ||= {class: "api-maker--table--settings"}}
          style={this.rootViewStyle ||= {
            width: "100%",
            maxWidth: 800,
            padding: 20,
            backgroundColor: "#fff",
            border: "1px solid black"
          }}
        >
          <View style={this.settingsHeaderViewStyle ||= {marginBottom: 5}}>
            <Text style={this.settingsHeaderTextSTyle ||= {fontSize: 16, fontWeight: "bold"}}>
              {t(".settings", {defaultValue: "Settings"})}
            </Text>
          </View>
          <DownloadAction table={table} />
          <View style={this.columnsHeaderViewStyle ||= {marginBottom: 5}}>
            <Text style={this.columnsHeaderTextStyle ||= {fontSize: 16, fontWeight: "bold"}}>
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
