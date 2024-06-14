import Column from "./column.mjs"
import {digg} from "diggerize"

export default class ApiMakerBaseModelAttribute {
  constructor(attributeData) {
    this.attributeData = attributeData
  }

  getColumn() {
    if (!this.column) this.column = new Column(digg(this, "attributeData", "column"))

    return this.column
  }

  isColumn = () => Boolean(digg(this, "attributeData", "column"))

  isSelectedByDefault() {
    const isSelectedByDefault = digg(this, "attributeData", "selected_by_default")

    if (isSelectedByDefault || isSelectedByDefault === null) return true

    return false
  }

  name = () => digg(this, "attributeData", "name")
}
