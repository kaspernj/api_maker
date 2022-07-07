export default function columnVisible(column, tableSettingColumn) {
  if (tableSettingColumn.visible() !== null) {
    console.log("get visible from table setting col", {column, visible: tableSettingColumn.visible()})
    return tableSettingColumn.visible()
  }
  if ("defaultVisible" in column) {
    console.log("get from default visible")

    return column.defaultVisible
  }

  return true
}
