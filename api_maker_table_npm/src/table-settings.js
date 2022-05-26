import {TableSetting} from "@kaspernj/api-maker/src/models"

export default class ApiMakerTableSettings {
  constructor({table}) {
    this.table = table
  }

  async loadSettings() {
    const tableSetting = await TableSetting.ransack({identifier: digg(this, "table", "props", "identifier")}).first()
  }
}
