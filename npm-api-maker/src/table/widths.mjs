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

    console.log({columns: this.columns})

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

    console.log({columnsWithoutWidth})

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

    console.log({updateData})
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
  }
}
