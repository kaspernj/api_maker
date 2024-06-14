import {digg} from "diggerize"

export default class ApiMakerBaseModelColumn {
  constructor(columnData) {
    if (!columnData) {
      throw new Error("No column data was given")
    }

    this.columnData = columnData
  }

  getType = () => digg(this, "columnData", "type")
}
