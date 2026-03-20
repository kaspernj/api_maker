/* eslint-disable arrow-body-style, import/no-unresolved, sort-imports */
import columnIdentifier from "./column-identifier.js"
import columnVisible from "./column-visible.js"
import {digg} from "diggerize"
import * as inflection from "inflection"
import Logger from "../logger.js"
import {ReadersWriterLock} from "epic-locks"
import {serialize as objectToFormData} from "object-to-formdata"
// @ts-expect-error
import {TableSetting} from "models.js"
// @ts-expect-error
import {v4 as uuidv4} from "uuid"

const logger = new Logger({name: "ApiMaker / TableSettings"})

// Have a lock for each unique table identifier
const tableSettingsLocks = {}

/** Persistent table settings manager. */
export default class ApiMakerTableSettings {
  /** Constructor. */
  constructor({table}) {
    this.table = table
    this.setTableSettingsLock()
  }

  /** setTableSettingsLock. */
  setTableSettingsLock() {
    const identifier = this.identifier()

    if (!(identifier in tableSettingsLocks)) {
      tableSettingsLocks[identifier] = new ReadersWriterLock()
    }

    this.tableSettingsLock = digg(tableSettingsLocks, identifier)
  }

  /** columns. */
  columns = () => digg(this, "table", "columnsAsArray")()

  /** columnsWithPositions. */
  columnsWithPositions = () => {
    return this
      .columns()
      .map((column, columnIndex) => ({column, identifier: columnIdentifier(column), position: columnIndex + 1}))
  }

  /** currentUser. */
  currentUser = () => digg(this, "table", "props", "currentUser")

  /** identifier. */
  identifier = () => digg(this, "table", "state", "identifier")

  /** preparedColumns. */
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

  /** orderedTableSettingColumns. */
  orderedTableSettingColumns = (tableSetting) => {
    return tableSetting
      .columns()
      .loaded()
      .sort((tableSettingColumn1, tableSettingColumn2) => tableSettingColumn1.position() - tableSettingColumn2.position())
  }

  /** loadExistingOrCreateTableSettings. */
  loadExistingOrCreateTableSettings = async () => {
    return await this.tableSettingsLock.write(async () => {
      let tableSetting = await this.loadTableSetting()

      if (tableSetting) {
        tableSetting = await this.updateTableSetting(tableSetting)
      } else {
        tableSetting = await this.createInitialTableSetting()

        if (!tableSetting) throw new Error("No tableSetting returned by createInitialTableSetting")
      }

      return tableSetting
    })
  }

  /** loadTableSetting. */
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

  /** currentUserIdOrFallback. */
  currentUserIdOrFallback() {
    const currentUser = this.currentUser()

    if (currentUser) return currentUser.id()

    return this.anonymouseUserId()
  }

  /** currentUserTypeOrFallback. */
  currentUserTypeOrFallback() {
    const currentUser = this.currentUser()

    if (currentUser) return digg(currentUser.modelClassData(), "name")

    return null
  }

  /** anonymouseUserId. */
  anonymouseUserId() {
    const variableName = `ApiMakerTableAnonymousUserId-${this.identifier()}`

    if (!(variableName in localStorage)) {
      const generatedId = uuidv4()

      localStorage[variableName] = generatedId
    }

    return digg(localStorage, variableName)
  }

  /** createInitialTableSetting. */
  createInitialTableSetting = async () => {
    const tableSettingData = {
      identifier: this.identifier(),
      user_id: this.currentUserIdOrFallback(),
      user_type: this.currentUserTypeOrFallback(),
      columns_attributes: {}
    }

    for (const [columnKey, {column, identifier, position}] of this.columnsWithPositions().entries()) {
      tableSettingData.columns_attributes[columnKey] = this.columnSaveData(column, {identifier, position})
    }

    const tableSetting = new TableSetting()
    const tableSettingFormData = objectToFormData({table_setting: tableSettingData})

    await tableSetting.saveRaw(tableSettingFormData)

    const reloadedTableSetting = await this.loadTableSetting()

    if (!reloadedTableSetting) throw new Error("No reloadedTableSetting returned by loadTableSetting")

    return reloadedTableSetting
  }

  /** columnSaveData. */
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

  /** updateTableSetting. */
  updateTableSetting = async (tableSetting) => {
    const changedAttributesList = ["attributeName", "sortKey"]
    const columnsWithPositions = this.columnsWithPositions()
    const columnsData = {}
    const tableSettingData = {columns_attributes: columnsData}
    const existingColumns = tableSetting.columns().loaded()
    let columnsKeyCount = 0
    let changed = false

    // Add missing columns
    for (const {column, identifier, position} of columnsWithPositions) {
      const tableSettingColumn = existingColumns.find((tableSettingColumn) => tableSettingColumn.identifier() == identifier)

      if (!tableSettingColumn) {
        const columnKey = ++columnsKeyCount

        columnsData[columnKey] = this.columnSaveData(
          column,
          {
            identifier,
            position
          }
        )

        logger.debug(() => `Changed because of new column at position ${position}: ${column.label}`)
        changed = true
      }
    }

    // Update existing columns to match the current column metadata without overwriting user-saved order.
    for (const {column, identifier} of columnsWithPositions) {
      const tableSettingColumn = existingColumns.find((tableSettingColumn) => tableSettingColumn.identifier() == identifier)

      if (tableSettingColumn) {
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
            attribute_name: column.attribute,
            id: tableSettingColumn.id(),
            path: column.path,
            sort_key: column.sortKey
          }
        }
      }
    }

    for (const tableSettingColumn of existingColumns) {
      const columnExists = columnsWithPositions.find(({identifier}) => identifier == tableSettingColumn.identifier())

      if (!columnExists) {
        // Removed saved columns no longer found.
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

      // Re-read the table setting after structural updates so prepared columns use the
      // persisted column list rather than the stale pre-save association cache.
      const reloadedTableSetting = await this.loadTableSetting()

      if (!reloadedTableSetting) throw new Error("No reloadedTableSetting returned by loadTableSetting")

      return reloadedTableSetting
    }

    return tableSetting
  }
}
