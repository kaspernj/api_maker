import columnIdentifier from "./column-identifier.mjs"
import columnVisible from "./column-visible.mjs"
import {digg} from "diggerize"
import inflection from "inflection"
import {serialize as objectToFormData} from "object-to-formdata"
import {TableSetting} from "../models.mjs.erb"

export default class ApiMakerTableSettings {
  constructor({table}) {
    this.table = table
  }

  columns = () => digg(this, "table", "columnsAsArray")()
  currentUser = () => digg(this, "table", "props", "currentUser")
  identifier = () => digg(this, "table", "shape", "identifier")

  preparedColumns = (tableSetting) => {
    const columns = this.table.columnsAsArray()
    const ordered = this.orderedTableSettingColumns(tableSetting)
    const result = {
      columns: [],
      preload: []
    }

    if (!ordered) return

    for (const tableSettingColumn of ordered) {
      const column = columns.find((column) => columnIdentifier(column) == tableSettingColumn.identifier())

      result.columns.push({column, tableSettingColumn})

      // Add needed preloads if column is visible
      if (columnVisible(column, tableSettingColumn)) {
        if (column.path) {
          const preload = column.path.map((pathPart) => inflection.underscore(pathPart)).join(".")

          if (!result.preload.includes(preload)) result.preload.push(preload)
        }
      }
    }

    return result
  }

  orderedTableSettingColumns = (tableSetting) => {
    return tableSetting
      .columns()
      .loaded()
      .sort((tableSettingColumn1, tableSettingColumn2) => tableSettingColumn1.position() - tableSettingColumn2.position())
  }

  loadExistingOrCreateTableSettings = async () => {
    let tableSetting = await this.loadTableSetting()

    if (tableSetting) {
      tableSetting = await this.updateTableSetting(tableSetting)
    } else {
      tableSetting = await this.createInitialTableSetting()
    }

    return tableSetting
  }

  loadTableSetting = async () => {
    if (!TableSetting) throw new Error("TableSetting model isn't globally available")

    const tableSetting = await TableSetting
      .ransack({
        identifier_eq: this.identifier(),
        user_id_eq: this.currentUser().id(),
        user_type_eq: digg(this.currentUser().modelClassData(), "name")
      })
      .preload("columns")
      .first()

    return tableSetting
  }

  createInitialTableSetting = async () => {
    const tableSettingData = {
      identifier: this.identifier(),
      user_id: this.currentUser().id(),
      user_type: digg(this.currentUser().modelClassData(), "name"),
      columns_attributes: {}
    }

    const columns = this.columns()

    for (const columnKey in columns) {
      const column = digg(columns, columnKey)
      const identifier = columnIdentifier(column)
      const columnData = this.columnSaveData(column, {identifier, position: columnKey})

      tableSettingData.columns_attributes[columnKey] = columnData
    }

    const tableSetting = new TableSetting()
    const tableSettingFormData = objectToFormData({table_setting: tableSettingData})

    await tableSetting.saveRaw(tableSettingFormData)

    const reloadedTableSetting = await this.loadTableSetting()

    return reloadedTableSetting
  }

  columnSaveData(column, {identifier, position}) {
    return {
      attribute_name: column.attribute,
      identifier,
      path: column.path,
      position,
      sort_key: column.sortKey,
      visible: null
    }
  }

  updateTableSetting = async (tableSetting) => {
    const columns = this.columns()
    const columnsData = {}
    const tableSettingData = {columns_attributes: columnsData}
    let columnsKeyCount = 0
    let changed = false

    // Add missing columns
    for (const column of columns) {
      const identifier = columnIdentifier(column)
      const tableSettingColumn = tableSetting.columns().loaded().find((tableSettingColumn) => tableSettingColumn.identifier() == identifier)

      if (!tableSettingColumn) {
        const columnKey = ++columnsKeyCount

        columnsData[columnKey] = this.columnSaveData(
          column,
          {
            identifier,
            position: tableSetting.columns().loaded().length + columnKey
          }
        )

        changed = true
      }
    }

    for (const tableSettingColumn of tableSetting.columns().loaded()) {
      const column = columns.find((column) => columnIdentifier(column) == tableSettingColumn.identifier())

      if (column) {
        // TODO: Update column if changed
      } else {
        // Removed saved columns no longer found
        const columnKey = ++columnsKeyCount

        columnsData[columnKey] = {
          id: tableSettingColumn.id(),
          _destroy: true
        }
        changed = true
      }
    }

    if (changed) {
      const tableSettingFormData = objectToFormData({table_setting: tableSettingData})

      await tableSetting.saveRaw(tableSettingFormData)
    }

    return tableSetting
  }
}
