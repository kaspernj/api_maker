import {digg} from "diggerize"

export default class TableWidths {
  constructor({columns, table, width}) {
    this.columns = columns
    this.tableWidth = width
    this.table = table
    this.setWidths()
  }

  setWidths() {
    this.columnsWidths = {}

    let widthLeft = this.tableWidth
    const updateData = []

    // Set widths that are defined
    for (const columnIndex in this.columns) {
      const column = this.columns[columnIndex]
      const tableSettingColumn = column.tableSettingColumn

      if (tableSettingColumn.hasWidth()) {
        column.width = tableSettingColumn.width()

        widthLeft -= tableSettingColumn.width()
      }
    }

    // Calculate how many columns are shown
    const columnsWithoutWidth = this.columns.filter((column) => !column.tableSettingColumn.hasWidth())
    let amountOfColumns = columnsWithoutWidth.length

    amountOfColumns++ // Actions column

    if (this.table.p.workplace) amountOfColumns++

    // Set widths of columns without
    for (const columnIndex in this.columns) {
      const column = this.columns[columnIndex]
      const tableSettingColumn = column.tableSettingColumn

      if (!tableSettingColumn.hasWidth()) {
        let newWidth = widthLeft / amountOfColumns

        if (newWidth < 200) newWidth = 200

        column.width = newWidth

        updateData << {
          id: tableSettingColumn.id(),
          width: newWidth
        }
      }
    }

    if (updateData.length > 0) {
      // FIXME: Should update the columns on the backend if anything changed
    }
  }

  getWidthOfColumn(identifier) {
    const column = this.columns.find((column) => column.tableSettingColumn.identifier() == identifier)

    if (!column) throw new Error(`No such column: ${identifier}`)

    return digg(column, "width")
  }

  setWidthOfColumn({identifier, width}) {
    const column = this.columns.find((column) => column.tableSettingColumn.identifier() == identifier)

    if (!column) throw new Error(`No such column: ${identifier}`)

    column.width = width

    this.table.setState({lastUpdate: new Date()})
  }
}
