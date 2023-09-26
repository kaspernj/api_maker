import "./style"
import columnIdentifier from "../column-identifier.mjs"
import EventListener from "../../event-listener.jsx"
import PropTypes from "prop-types"
import React from "react"

class ColumnRow extends React.PureComponent {
  static propTypes = {
    column: PropTypes.object.isRequired,
    table: PropTypes.object.isRequired,
    tableSettingColumn: PropTypes.object.isRequired
  }

  checked = this.props.tableSettingColumn.visible()
  checkboxRef = React.createRef()

  componentDidMount() {
    this.updateCheckboxChecked()
  }

  componentDidUpdate() {
    this.updateCheckboxChecked()
  }

  render() {
    const {column, tableSettingColumn} = this.props
    const checkboxProps = {}

    if (tableSettingColumn.visible() === true) {
      checkboxProps.checked = "checked"
    } else if (tableSettingColumn.visible() === null) {
      checkboxProps.indeterminate = "indeterminate"
    }

    return (
      <div className="api-maker--table--settings--column-row">
        <label>
          <input onChange={this.onCheckboxChange} ref={this.checkboxRef} type="checkbox" {...checkboxProps} />
          {column.label}
        </label>
      </div>
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
    const {checked} = this

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
    const {table, tableSettingColumn} = this.props

    await tableSettingColumn.update({visible: this.checked})
    table.updateSettingsFullCacheKey()
  }
}

export default class ApiMakerTableSettings extends React.PureComponent {
  static propTypes = {
    onRequestClose: PropTypes.func.isRequired,
    table: PropTypes.object.isRequired
  }

  rootRef = React.createRef()

  render() {
    const {table} = this.props
    const {preparedColumns} = table.shape

    return (
      <div className="api-maker--table--settings" ref={this.rootRef}>
        <EventListener event="mouseup" onCalled={this.onWindowMouseUp} target={window} />
        {preparedColumns?.map(({column, tableSettingColumn}) =>
          <ColumnRow column={column} key={columnIdentifier(column)} table={table} tableSettingColumn={tableSettingColumn} />
        )}
      </div>
    )
  }

  onWindowMouseUp = (e) => {
    if (this.rootRef.current && !this.rootRef.current.contains(e.target)) {
      this.props.onRequestClose()
    }
  }
}
