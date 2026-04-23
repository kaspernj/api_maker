// @ts-check
/* eslint-disable max-len, sort-imports */
import React, {useEffect, useRef} from "react"
import columnIdentifier from "../column-identifier.js"
import memo from "set-state-compare/build/memo.js"
import PropTypes from "prop-types"
import propTypesExact from "prop-types-exact"
import {ShapeComponent, shapeComponent} from "set-state-compare/build/shape-component.js"
import Text from "../../utils/text"
import {View} from "react-native"

/**
 * @typedef {object} Props
 * @property {object} column
 * @property {object} table
 * @property {object} tableSettingColumn
 */
/** @typedef {Record<string, never>} State */
export default memo(shapeComponent(/** @augments {ShapeComponent<Props, State>} */ class ColumnRow extends ShapeComponent {
  static propTypes = propTypesExact({
    column: PropTypes.object.isRequired,
    table: PropTypes.object.isRequired,
    tableSettingColumn: PropTypes.object.isRequired
  })

  setup() {
    this.checkboxRef = useRef(undefined)
    this.visible = this.p.tableSettingColumn.visible()

    useEffect(() => {
      this.updateCheckboxChecked()
    }, [this.visible])
  }

  render() {
    const {column, table, tableSettingColumn} = this.p
    const checked = tableSettingColumn.visible() === true

    return (
      <View dataSet={this.cache("rootViewDataSet", {component: "api-maker--table--settings--column-row"})} style={this.cache("rootViewStyle", {justifyContent: "center"})}>
        <label style={{whiteSpace: "nowrap"}}>
          <input
            checked={checked}
            className="api-maker--table--setings--column-checkbox"
            data-identifier={columnIdentifier(column)}
            onChange={this.onCheckboxChange}
            ref={this.checkboxRef}
            type="checkbox"
          />
          <Text>
            {table.headerLabelForColumn(column)}
          </Text>
        </label>
      </View>
    )
  }

  onCheckboxChange = () => {
    const checked = this.p.tableSettingColumn.visible()
    let visible

    if (checked === true) {
      visible = null
    } else if (checked === null) {
      visible = false
    } else {
      visible = true
    }

    this.updateCheckboxChecked(visible)
    this.updateTableSettingColumn(visible)
  }

  updateCheckboxChecked(visible = this.p.tableSettingColumn.visible()) {
    if (visible === true) {
      this.checkboxRef.current.checked = true
      this.checkboxRef.current.indeterminate = undefined
    } else if (visible === null) {
      this.checkboxRef.current.checked = undefined
      this.checkboxRef.current.indeterminate = true
    } else {
      this.checkboxRef.current.checked = undefined
      this.checkboxRef.current.indeterminate = undefined
    }
  }

  async updateTableSettingColumn(visible) {
    const {table, tableSettingColumn} = this.p

    await tableSettingColumn.update({visible})

    table.events.emit("columnVisibilityUpdated", {tableSettingColumn})
  }
}))
