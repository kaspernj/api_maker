import columnIdentifier from "@kaspernj/api-maker-table/src/column-identifier"
import {digg} from "diggerize"
import {serialize as objectToFormData} from "object-to-formdata"
import {TableSetting} from "@kaspernj/api-maker/src/models"

export default class ApiMakerTableSettings {
  constructor({table}) {
    this.table = table
  }

  columns = () => digg(this, "table", "props", "columns")()
  currentUser = () => digg(this, "table", "props", "currentUser")
  identifier = () => digg(this, "table", "props", "identifier")

  async loadSettings() {
    const tableSetting = await TableSetting
      .ransack({
        identifier_eq: this.identifier(),
        user_id_eq: this.currentUser().id(),
        user_type_eq: digg(this.currentUser().modelClassData(), "name")
      })
      .preload("columns")
      .first()

    if (tableSetting) {
      this.shape.set({tableSetting})
    } else {
      this.createInitialTableSetting()
    }
  }

  async createInitialTableSetting() {
    const tableSettingData = {
      identifier: this.identifier(),
      user_id: this.currentUser().id(),
      user_type: digg(this.currentUser().modelClassData(), "name"),
      columns_attributes: {}
    }

    const columns = this.columns()

    console.log({columns})

    for (const columnKey in columns) {
      const column = digg(columns, columnKey)
      const identifier = columnIdentifier(column)
      const columnData = {
        attribute_name: column.attribute,
        identifier,
        path: column.path,
        position: columnKey,
        sort_key: column.sortKey
      }

      tableSettingData.columns_attributes[columnKey] = columnData
    }

    console.log({tableSettingData})

    const tableSetting = new TableSetting()
    const tableSettingFormData = objectToFormData({table_setting: tableSettingData})

    await tableSetting.saveRaw(tableSettingFormData)
  }
}
