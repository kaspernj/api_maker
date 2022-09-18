import {digg} from "diggerize"

export default class ApiMakerBaseModelAttribute {
  constructor(attributeData) {
    this.attributeData = attributeData
  }

  isColumn() {
    return Boolean(digg(this, "attributeData", "column"))
  }

  isSelectedByDefault() {
    const isSelectedByDefault = digg(this, "attributeData", "selected_by_default")

    if (isSelectedByDefault || isSelectedByDefault === null) return true

    return false
  }

  name() {
    return digg(this, "attributeData", "name")
  }
}
