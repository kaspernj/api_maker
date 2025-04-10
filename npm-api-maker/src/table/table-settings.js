import columnIdentifier from "./column-identifier"
import columnVisible from "./column-visible"
import {digg} from "diggerize"
import * as inflection from "inflection"
import Logger from "../logger"
import {ReadersWriterLock} from "epic-locks"
import {serialize as objectToFormData} from "object-to-formdata"
import {TableSetting} from "models"
import {v4 as uuidv4} from "uuid"

const logger = new Logger({name: "ApiMaker / TableSettings"})

// Have a lock for each unique table identifier
const tableSettingsLocks = {}

export default class ApiMakerTableSettings {
  constructor({table}) {
    this.table = table
    this.setTableSettingsLock()
  }

  setTableSettingsLock() {
    const identifier = this.identifier()

    if (!(identifier in tableSettingsLocks)) {
      tableSettingsLocks[identifier] = new ReadersWriterLock()
    }

    this.tableSettingsLock = digg(tableSettingsLocks, identifier)
  }

  columns = () => digg(this, "table", "columnsAsArray")()
  currentUser = () => digg(this, "table", "props", "currentUser")
  identifier = () => digg(this, "table", "state", "identifier")

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
    return await this.tableSettingsLock.write(async () => {
      let tableSetting = await this.loadTableSetting()

      if (tableSetting) {
        tableSetting = await this.updateTableSetting(tableSetting)
      } else {
        tableSetting = await this.createInitialTableSetting()
      }

      return tableSetting
    })
  }

  loadTableSetting = async () => {
    if (!TableSetting) throw new Error("TableSetting model isn't globally available")

    const tableSetting = await TableSetting
      .ransack({
        identifier_eq: this.identifier(),
        user_id_eq: this.currentUserIdOrFallback(),
        user_type_eq: this.currentUserTypeOrFallback()
      })
      .preload("columns")
      .first()

    return tableSetting
  }

  currentUserIdOrFallback() {
    const currentUser = this.currentUser()

    if (currentUser) return currentUser.id()

    return this.anonymouseUserId()
  }

  currentUserTypeOrFallback() {
    const currentUser = this.currentUser()

    if (currentUser) return digg(currentUser.modelClassData(), "name")

    return null
  }

  anonymouseUserId() {
    const variableName = `ApiMakerTableAnonymousUserId-${this.identifier()}`

    if (!(variableName in localStorage)) {
      const generatedId = uuidv4()

      localStorage[variableName] = generatedId
    }

    return digg(localStorage, variableName)
  }

  createInitialTableSetting = async () => {
    const tableSettingData = {
      identifier: this.identifier(),
      user_id: this.currentUserIdOrFallback(),
      user_type: this.currentUserTypeOrFallback(),
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
    const changedAttributesList = ["attributeName", "sortKey"]
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

        logger.debug(() => `Changed because of new column: ${column.label}`)
        changed = true
      }
    }

    for (const tableSettingColumn of tableSetting.columns().loaded()) {
      const column = columns.find((column) => columnIdentifier(column) == tableSettingColumn.identifier())

      if (column) {
        // TODO: Update column if changed
        let columnChanged = false

        for (const changedAttribute of changedAttributesList) {
          let columnAttributeName

          if (changedAttribute == "attributeName") {
            columnAttributeName = "attribute"
          } else {
            columnAttributeName = changedAttribute
          }

          const oldAttributeValue = tableSettingColumn[changedAttribute]()
          const newAttributeValue = column[columnAttributeName]

          if (oldAttributeValue != newAttributeValue) {
            logger.debug(() => `${changedAttribute} changed from ${oldAttributeValue} to ${newAttributeValue} on column: ${column.label}`)
            columnChanged = true
          }
        }

        const columnPathAsString = JSON.stringify(column.path)
        const tableSettingColumnPathAsString = tableSettingColumn.path()

        if (columnPathAsString != tableSettingColumnPathAsString) {
          logger.debug(() => `Path changed on ${column.label} from ${columnPathAsString} to ${tableSettingColumnPathAsString}`)
          columnChanged = true
        }

        if (columnChanged) {
          const columnKey = ++columnsKeyCount

          changed = true
          columnsData[columnKey] = {
            attribute_name: column.attributeName,
            id: tableSettingColumn.id(),
            path: column.path,
            sort_key: column.sortKey
          }
        }
      } else {
        // Removed saved columns no longer found
        const columnKey = ++columnsKeyCount

        columnsData[columnKey] = {
          id: tableSettingColumn.id(),
          _destroy: true
        }
        changed = true

        logger.debug(() => `Column got removed: ${tableSettingColumn.identifier()}`)
      }
    }

    if (changed) {
      const tableSettingFormData = objectToFormData({table_setting: tableSettingData})

      await tableSetting.saveRaw(tableSettingFormData)
    }

    return tableSetting
  }
}
