/* eslint-disable no-continue, sort-imports */
import {digg, digs} from "diggerize"
import * as inflection from "inflection"
import modelClassRequire from "../model-class-require.js"

/** Computes table select payloads for queries. */
class SelectCalculator {
  constructor({table}) {
    this.table = table
  }

  selects() {
    const {modelClass} = digs(this.table.props, "modelClass")
    const select = this.table.props.select || {}
    const {preparedColumns} = digs(this.table.state, "preparedColumns")


    // Ensure the primary key column is loader for the primary model class
    const className = digg(modelClass.modelClassData(), "name")
    const primaryKeyColumnName = modelClass.primaryKey()

    if (!(className in select)) select[className] = []
    if (!select[className].includes(primaryKeyColumnName)) select[className].push(primaryKeyColumnName)


    // Ensure 'updatedAt' is selected if defined as an attribute, because it is used for cacheKey and updates in the table
    if (modelClass.hasAttribute("updatedAt")) {
      if (!(className in select)) select[className] = []
      if (!select[className].includes("updatedAt")) select[className].push("updatedAt")
    }


    // Ensure columns used for columns are loaded
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

          currentModelClass = modelClassRequire(digg(relationship, "resource_name"))
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
