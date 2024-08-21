import "./style"
import BaseComponent from "../../base-component"
import columnIdentifier from "../column-identifier.mjs"
import ColumnRow from "./column-row"
import {memo, useRef} from "react"
import PropTypes from "prop-types"
import propTypesExact from "prop-types-exact"
import {shapeComponent} from "set-state-compare/src/shape-component.js"
import useEventListener from "../../use-event-listener"
import {Text, View} from "react-native"

export default memo(shapeComponent(class ApiMakerTableSettings extends BaseComponent {
  static propTypes = propTypesExact({
    onFixedTableLayoutChanged: PropTypes.func.isRequired,
    onRequestClose: PropTypes.func.isRequired,
    table: PropTypes.object.isRequired
  })

  setup() {
    this.rootRef = useRef()

    useEventListener(window, "mouseup", this.tt.onWindowMouseUp)
    this.useStates({
      fixedTableLayout: this.tableSetting().fixedTableLayout()
    })
  }

  tableSetting = () => this.p.table.s.tableSetting

  render() {
    const {table} = this.p
    const {preparedColumns} = table.s

    return (
      <div className="api-maker--table--settings" ref={this.tt.rootRef}>
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
      </div>
    )
  }

  onWindowMouseUp = (e) => {
    if (this.tt.rootRef.current && !this.tt.rootRef.current.contains(e.target)) {
      this.p.onRequestClose()
    }
  }
}))
