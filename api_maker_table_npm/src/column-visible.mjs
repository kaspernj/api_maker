export default function columnVisible(column, tableSettingColumn) {
  if (tableSettingColumn.visible() !== null) return tableSettingColumn.visible()
  if (!column) return false
  if ("defaultVisible" in column) return column.defaultVisible

  return true
}
