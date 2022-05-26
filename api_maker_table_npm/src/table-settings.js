import {TableSetting} from "@kaspernj/api-maker/src/models"

export default class ApiMakerTableSettings {
  constructor({table}) {
    this.table = table
  }

  async loadSettings() {
    console.log({props: this.table.props})

    const tableSetting = await TableSetting.ransack({identifier_eq: digg(this, "table", "props", "identifier")}).first()
  }
}
