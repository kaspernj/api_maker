import * as inflection from "inflection"
import {digg, digs} from "diggerize"

const modelConfigRequireContext = import.meta.webpackContext("super-admin/model-configs", {
  recursive: true,
  regExp: /\.(jsx|js)$/
})

export default class ApiMakerSuperAdminConfigReader {
  static forModel(modelClass) {
    const modelNameCamelized = digg(modelClass.modelClassData(), "nameDasherized")
    let modelConfig

    for (const configPath of [`./${modelNameCamelized}.jsx`, `./${modelNameCamelized}.js`]) {
      try {
        modelConfig = modelConfigRequireContext(configPath).default
        break
      } catch (error) {
        if (!error.message.includes("Cannot find module")) {
          throw error
        }
      }
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
