import {digg, digs} from "diggerize"
import inflection from "inflection"
import modelClassRequire from "@kaspernj/api-maker/src/model-class-require.mjs"

class SelectCalculator {
  constructor({table}) {
    this.table = table
  }

  selects() {
    const {modelClass} = digs(this.table.props, "modelClass")
    const select = this.table.props.select || {}
    const {preparedColumns} = digs(this.table.shape, "preparedColumns")

    for (const preparedColumn of preparedColumns) {
      const {column} = digs(preparedColumn, "column")

      if (!column?.attribute) continue // 'column' might not exist if has been removed in code but still saved in DB

      const {attribute} = digs(column, "attribute")
      const {path} = column

      let currentModelClass = modelClass

      if (path) {
        for (const pathPart of path) {
          const relationships = digg(currentModelClass.modelClassData(), "relationships")
          const relationship = relationships.find((relationshipInArray) => relationshipInArray.name == inflection.underscore(pathPart))

          if (!relationship) throw new Error(`No such relationship: ${currentModelClass.modelClassData().name}#${pathPart}`)

          currentModelClass = modelClassRequire(digg(relationship, "className"))
        }
      }

      const currentModelClassName = digg(currentModelClass.modelClassData(), "name")

      if (!(currentModelClassName in select)) select[currentModelClassName] = []
      if (!select[currentModelClassName].includes(attribute)) select[currentModelClassName].push(attribute)
    }

    return select
  }
}

export default function selectCalculator(...props) {
  return new SelectCalculator(...props).selects()
}
