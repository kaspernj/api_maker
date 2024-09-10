import BaseComponent from "../../base-component"
import columnIdentifier from "../column-identifier.mjs"
import ColumnRow from "./column-row"
import {memo, useRef} from "react"
import PropTypes from "prop-types"
import propTypesExact from "prop-types-exact"
import {shapeComponent} from "set-state-compare/src/shape-component.js"
import {Modal, Text, View} from "react-native"

export default memo(shapeComponent(class ApiMakerTableSettings extends BaseComponent {
  static propTypes = propTypesExact({
    onRequestClose: PropTypes.func.isRequired,
    table: PropTypes.object.isRequired
  })

  setup() {
    this.rootRef = useRef()

    this.useStates({
      fixedTableLayout: this.tableSetting().fixedTableLayout()
    })
  }

  tableSetting = () => this.p.table.s.tableSetting

  render() {
    const {table} = this.p
    const {preparedColumns} = table.s

    return (
      <Modal onBackdropPress={this.p.onRequestClose} onRequestClose={this.p.onRequestClose} transparent>
        <View
          dataSet={{class: "api-maker--table--settings"}}
          style={{
            width: "100%",
            maxWidth: 800,
            marginHorizontal: "auto",
            marginVertical: "auto",
            padding: 20,
            backgroundColor: "#fff",
            border: "1px solid black"
          }}
        >
          <View style={{marginBottom: 5}}>
            <Text style={{fontSize: 16, fontWeight: "bold"}}>
              Settings
            </Text>
          </View>
          <View style={{marginBottom: 5}}>
            <Text style={{fontSize: 16, fontWeight: "bold"}}>
              Columns
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
