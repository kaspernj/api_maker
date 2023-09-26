import "./style"
import columnIdentifier from "../column-identifier.mjs"
import React from "react"

class ColumnRow extends React.PureComponent {
  static propTypes = {
    column: PropTypes.object.isRequired,
    tableSettingColumn: PropTypes.object.isRequired
  }

  checked = this.props.tableSettingColumn.visible()
  checkboxRef = React.createRef()

  componentDidMount() {
    this.updateCheckboxChecked()
  }

  render() {
    const {column, tableSettingColumn} = this.props
    const checkboxProps = {}

    console.log({column, tableSettingColumn})

    console.log("What was visible then?", {visible: tableSettingColumn.visible()})

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

  onCheckboxChange = (e) => {
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
      this.checkboxRef.current.checked = false
      this.checkboxRef.current.indeterminate = undefined
    }
  }

  async updateTableSettingColumn() {
    const {tableSettingColumn} = this.props

    await tableSettingColumn.update({visible: this.checked})
  }
}

export default class ApiMakerTableSettings extends React.PureComponent {
  render() {
    const {table} = this.props
    const {preparedColumns} = table.shape

    return (
      <div className="api-maker--table--settings">
        {preparedColumns?.map(({column, tableSettingColumn}) =>
          <ColumnRow column={column} key={columnIdentifier(column)} tableSettingColumn={tableSettingColumn} />
        )}
      </div>
    )
  }
}
