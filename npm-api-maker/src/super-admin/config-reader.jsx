import {digg, digs} from "diggerize"
import * as inflection from "inflection"

export default class ApiMakerSuperAdminConfigReader {
  static forModel(modelClass) {
    const modelNameCamelized = digg(modelClass.modelClassData(), "nameDasherized")
    let modelConfig

    try {
      modelConfig = require(`super-admin/model-configs/${modelNameCamelized}`).default
    } catch (error) {
      if (error.message.includes("Cannot find module")) {
        console.debug(`No model-config for ${modelClass.modelClassData().name}`)
      } else {
        throw error
      }
    }

    return new ApiMakerSuperAdminConfigReader(modelClass, modelConfig)
  }

  constructor(modelClass, modelConfig) {
    this.modelClass = modelClass
    this.modelConfig = modelConfig
  }

  attributesToShow() {
    const {modelConfig} = digs(this, "modelConfig")

    if (modelConfig?.show?.attributesToShow) {
      return modelConfig.show.attributesToShow()
    }

    return this.defaultAttributesToShow()
  }

  defaultAttributesToShow() {
    const attributesToShow = []

    for (const column of this.defaultTableColumns()) {
      attributesToShow.push(digg(column, "attribute"))
    }

    return attributesToShow
  }

  tableColumns() {
    const {modelConfig} = digs(this, "modelConfig")

    if (modelConfig?.table?.columns) {
      return modelConfig.table.columns()
    }

    return this.defaultTableColumns()
  }

  defaultTableColumns() {
    const {modelClass} = digs(this, "modelClass")
    const attributes = modelClass.attributes()
    const columns = []

    for (const attribute of attributes) {
      if (!attribute.isSelectedByDefault()) continue

      const camelizedName = inflection.camelize(attribute.name(), true)
      const column = {
        attribute: camelizedName
      }

      if (attribute.isColumn()) column.sortKey = camelizedName

      columns.push(column)
    }

    return columns
  }
}
