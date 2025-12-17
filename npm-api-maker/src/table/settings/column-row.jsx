import React, {useEffect, useRef} from "react"
import BaseComponent from "../../base-component.js"
import columnIdentifier from "../column-identifier.js"
import memo from ""set-state-compare/build/memo.js"
import PropTypes from "prop-types"
import propTypesExact from "prop-types-exact"
import {shapeComponent} from ""set-state-compare/build/shape-component.js"
import Text from "../../utils/text"
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
      <View dataSet={this.rootViewDataSet ||= {component: "api-maker--table--settings--column-row"}} style={this.rootViewStyle ||= {justifyContent: "center"}}>
        <label style={{whiteSpace: "nowrap"}}>
          <input
            className="api-maker--table--setings--column-checkbox"
            data-identifier={columnIdentifier(column)}
            onChange={this.onCheckboxChange}
            ref={this.checkboxRef}
            type="checkbox"
            {...checkboxProps}
          />
          <Text>
            {table.headerLabelForColumn(column)}
          </Text>
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

    table.events.emit("columnVisibilityUpdated", {tableSettingColumn})
  }
}))
