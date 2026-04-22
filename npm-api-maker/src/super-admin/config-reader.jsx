// @ts-check
import * as inflection from "inflection"
import {digg, digs} from "diggerize"
// @ts-expect-error Runtime-resolved module
import config from "super-admin/config" // eslint-disable-line import/no-unresolved

export default class ApiMakerSuperAdminConfigReader {
  static forModel(modelClass) {
    const modelNameDasherized = digg(modelClass.modelClassData(), "nameDasherized")
    const modelConfigs = config.modelConfigs
    let modelConfig

    if (typeof modelConfigs == "function") {
      modelConfig = modelConfigs(modelNameDasherized)
    } else {
      modelConfig = modelConfigs?.[modelNameDasherized]
    }

    if (!modelConfig) {
      console.debug(`No model-config for ${modelClass.modelClassData().name}`)
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
    const {columns} = this.defaultTableColumns()

    for (const column of columns) {
      attributesToShow.push(digg(column, "attribute"))
    }

    return attributesToShow
  }

  tableColumns() {
    const {modelConfig} = digs(this, "modelConfig")

    if (modelConfig?.table?.columns) {
      return {
        columns: modelConfig.table.columns()
      }
    } else {
      return this.defaultTableColumns()
    }
  }

  defaultTableColumns() {
    const {modelClass} = digs(this, "modelClass")
    const attributes = modelClass.attributes()
    const columns = []
    const select = {}
    const modelClassSelect = []

    select[modelClass.modelClassData().name] = modelClassSelect

    for (const attribute of attributes) {
      if (attribute.isSelectedByDefault() || attribute.name() == "name") {
        const camelizedName = inflection.camelize(attribute.name(), true)
        const column = {
          attribute: camelizedName
        }

        if (attribute.isColumn()) {
          column.sortKey = camelizedName
        } else if (attribute.isTranslated()) {
          column.sortKey = `currentTranslation${camelizedName}`
        }

        modelClassSelect.push(camelizedName)
        columns.push(column)
      }
    }

    return {columns, select}
  }
}
