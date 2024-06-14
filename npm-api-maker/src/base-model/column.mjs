import {digg} from "diggerize"

export default class ApiMakerBaseModelColumn {
  constructor(columnData) {
    this.columnData = columnData
  }

  getType = () => digg(this, "columnData", "type")
}
