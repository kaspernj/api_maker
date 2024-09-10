import BaseComponent from "../../base-component"
import columnIdentifier from "../column-identifier.mjs"
import PropTypes from "prop-types"
import propTypesExact from "prop-types-exact"
import {memo, useEffect, useRef} from "react"
import {shapeComponent} from "set-state-compare/src/shape-component.js"
import {View} from "react-native"

export default memo(shapeComponent(class ColumnRow extends BaseComponent {
  static propTypes = propTypesExact({
    column: PropTypes.object.isRequired,
    table: PropTypes.object.isRequired,
    tableSettingColumn: PropTypes.object.isRequired
  })

  setup() {
    this.checked = this.p.tableSettingColumn.visible()
    this.checkboxRef = useRef()

    useEffect(() => {
      this.updateCheckboxChecked()
    }, [this.checked])
  }

  render() {
    const {column, table, tableSettingColumn} = this.p
    const checkboxProps = {}

    if (tableSettingColumn.visible() === true) {
      checkboxProps.checked = "checked"
    } else if (tableSettingColumn.visible() === null) {
      checkboxProps.indeterminate = "indeterminate"
    }

    return (
      <View dataSet={{component: "api-maker--table--settings--column-row"}} style={{justifyContent: "center"}}>
        <label style={{whiteSpace: "nowrap"}}>
          <input
            className="api-maker--table--setings--column-checkbox"
            data-identifier={columnIdentifier(column)}
            onChange={this.onCheckboxChange}
            ref={this.checkboxRef}
            type="checkbox"
            {...checkboxProps}
          />
          {table.headerLabelForColumn(column)}
        </label>
      </View>
    )
  }

  onCheckboxChange = () => {
    const {checked} = this

    if (checked === true) {
      this.checked = null
    } else if (checked === null) {
      this.checked = false
    } else {
      this.checked = true
    }

    this.updateCheckboxChecked()
    this.updateTableSettingColumn()
  }

  updateCheckboxChecked() {
    const {checked} = this.tt

    if (checked === true) {
      this.checkboxRef.current.checked = true
      this.checkboxRef.current.indeterminate = undefined
    } else if (checked === null) {
      this.checkboxRef.current.checked = undefined
      this.checkboxRef.current.indeterminate = true
    } else {
      this.checkboxRef.current.checked = undefined
      this.checkboxRef.current.indeterminate = undefined
    }
  }

  async updateTableSettingColumn() {
    const {table, tableSettingColumn} = this.p

    await tableSettingColumn.update({visible: this.checked})
    table.updateSettingsFullCacheKey()
  }
}))
