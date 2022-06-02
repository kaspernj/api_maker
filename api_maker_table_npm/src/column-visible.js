export default function columnVisible(tableSettingColumn) {
  return (tableSettingColumn.visible() === null || tableSettingColumn.visible())
}
