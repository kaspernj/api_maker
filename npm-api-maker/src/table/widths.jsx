import {Animated} from "react-native"
import {digg} from "diggerize"

export default class TableWidths {
  constructor({columns, table, width}) {
    this.columns = columns
    this.tableWidth = width
    this.table = table
    this.usedFallbackWidth = width === undefined
    this.setWidths()
  }

  setWidths() {
    this.columnsWidths = {}
    const columnsWithoutWidth = this.columns.filter((column) => !column.tableSettingColumn.hasWidth())
    let amountOfColumns = columnsWithoutWidth.length
    let widthLeft = this.tableWidth
    const updateData = []

    amountOfColumns++ // Actions column

    if (this.table.p.workplace) amountOfColumns++

    if (widthLeft === undefined) {
      // Fall back to minimum per-column widths until RN-web reports the real container width.
      widthLeft = amountOfColumns * 200
    }

    // Set widths that are defined
    for (const columnIndex in this.columns) {
      const column = this.columns[columnIndex]
      const tableSettingColumn = column.tableSettingColumn

      column.animatedPosition ||= new Animated.ValueXY()
      column.animatedZIndex ||= new Animated.Value(0)

      if (tableSettingColumn.hasWidth()) {
        if (column.animatedWidth) {
          column.animatedWidth.setValue(tableSettingColumn.width())
        } else {
          column.animatedWidth = new Animated.Value(tableSettingColumn.width())
        }

        column.width = tableSettingColumn.width()

        widthLeft -= tableSettingColumn.width()
      }
    }

    // Set widths of columns without
    for (const columnIndex in this.columns) {
      const column = this.columns[columnIndex]
      const tableSettingColumn = column.tableSettingColumn

      if (!tableSettingColumn.hasWidth()) {
        let newWidth = widthLeft / amountOfColumns

        if (newWidth < 200) newWidth = 200

        if (column.animatedWidth) {
          column.animatedWidth.setValue(newWidth)
        } else {
          column.animatedWidth = new Animated.Value(newWidth)
        }

        column.width = newWidth

        updateData.push({
          id: tableSettingColumn.id(),
          width: newWidth
        })
      }
    }

    if (updateData.length > 0) {
      // FIXME: Should update the columns on the backend if anything changed
    }
  }

  /** Apply the measured table width after an initial fallback-width bootstrap. */
  updateTableWidth(width) {
    this.tableWidth = width
    this.usedFallbackWidth = false
    this.setWidths()
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
    column.animatedWidth.setValue(width)
  }
}
