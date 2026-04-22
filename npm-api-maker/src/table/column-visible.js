// @ts-check
/**
 * Returns whether a table column should be visible.
 * @param {{defaultVisible?: boolean} | undefined} column
 * @param {{visible(): boolean | null}} tableSettingColumn
 * @returns {boolean}
 */
export default function columnVisible(column, tableSettingColumn) {
  if (tableSettingColumn.visible() !== null) return tableSettingColumn.visible()
  if (!column) return false
  if ("defaultVisible" in column) return column.defaultVisible

  return true
}
