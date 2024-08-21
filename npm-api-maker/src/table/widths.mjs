import {digg} from "diggerize"

export default class TableWidths {
  constructor({columns, flatListWidth, table}) {
    this.columns = columns
    this.flatListWidth = flatListWidth
    this.table = table
    this.setWidths()
  }

  setWidths() {
    let widthLeft = 100.0

    this.columnsWidths = {}

    const updateData = []

    // Set widths that are defined
    for (const columnIndex in this.columns) {
      const column = this.columns[columnIndex].tableSettingColumn

      if (column.hasWidth()) {
        this.columns[columnIndex].width = column.width()

        widthLeft -= column.width()
      }
    }

    // Set widths of columns without
    const columnsWithoutWidth = this.columns.filter((column) => !column.tableSettingColumn.hasWidth())

    for (const columnIndex in this.columns) {
      const column = this.columns[columnIndex].tableSettingColumn

      if (!column.hasWidth()) {
        const newWidth = widthLeft / columnsWithoutWidth.length

        this.columns[columnIndex].width = newWidth

        updateData << {
          id: column.id(),
          width: newWidth
        }
      }
    }

    // FIXME: Should update the columns on the backend if anything changed
  }

  getWidthOfColumn(identifier) {
    const column = this.columns.find((column) => column.tableSettingColumn.identifier() == identifier)

    if (!column) throw new Error(`No such column: ${identifier}`)

    return digg(column, "width")
  }

  setWidthOfColumn({identifier, width}) {
    const column = this.columns.find((column) => column.tableSettingColumn.identifier() == identifier)

    if (!column) throw new Error(`No such column: ${identifier}`)

    const widthPercent = (width / this.flatListWidth) * 100

    column.width = widthPercent

    this.table.setState({lastUpdate: new Date()})

    // FIXME: Should reduce / enlarge sibling columns to keep a 100% fit
  }
}
