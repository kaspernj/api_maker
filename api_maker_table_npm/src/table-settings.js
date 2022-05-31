import {digg, digs} from "diggerize"
import {serialize as objectToFormData} from "object-to-formdata"
import {TableSetting} from "@kaspernj/api-maker/src/models"

export default class ApiMakerTableSettings {
  constructor({table}) {
    this.table = table
    this.columns = digg(table, "props", "columns")
    this.identifier = digg(table, "props", "identifier")
  }

  async loadSettings() {
    console.log({props: this.table.props})

    const {identifier} = digs(this, "identifier")
    const tableSetting = await TableSetting
      .ransack({identifier_eq: identifier})
      .preload("table_setting_columns")
      .first()

    if (tableSetting) {
      this.shape.set({tableSetting})
    } else {
      this.createInitialTableSetting()
    }
  }

  async createInitialTableSetting() {
    const {columns, identifier} = digs(this, "columns", "identifier")
    const tableSettingData = {
      identifier,
      table_setting_columns_attributes: {}
    }

    for (const columnKey in columns) {
      const column = digg(columns, columnKey)
      const columnData = {}

      tableSettingData.table_setting_columns_attributes[columnKey] = columnData
    }

    console.log({tableSettingData})

    const tableSetting = new TableSetting()
    const tableSettingFormData = objectToFormData({table_setting: tableSettingData})

    await tableSetting.saveRaw(tableSettingFormData)
  }
}
