// @ts-check
/* eslint-disable no-continue, sort-imports */
import {digg, digs} from "diggerize"
import * as inflection from "inflection"
import modelClassRequire from "../model-class-require.js"

/** @typedef {{name: string, resource_name: string}} ModelRelationship */
/** @typedef {{attribute?: string, path?: string[]}} SelectColumnDefinition */
/** @typedef {{column: SelectColumnDefinition}} PreparedColumn */
/** @typedef {Record<string, string[]>} SelectMap */
/**
 * @typedef {object} SelectModelClass
 * @property {(attributeName: string) => boolean} hasAttribute
 * @property {() => {name: string, relationships: ModelRelationship[]}} modelClassData
 * @property {() => string} primaryKey
 */
/** @typedef {{props: {modelClass: SelectModelClass, select?: SelectMap}, state: {preparedColumns: PreparedColumn[]}}} SelectTable */

/** Computes table select payloads for queries. */
class SelectCalculator {
  /**
   * Creates a select calculator for one table instance.
   * @param {object} root0
   * @param {SelectTable} root0.table
   */
  constructor({table}) {
    this.table = table
  }

  /**
   * Builds the final per-model select map needed for the current table columns.
   * @returns {SelectMap}
   */
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

/**
 * Calculates the backend select payload for the current table render.
 * @param {{table: SelectTable}} props
 * @returns {SelectMap}
 */
export default function selectCalculator(props) {
  return new SelectCalculator(props).selects()
}
