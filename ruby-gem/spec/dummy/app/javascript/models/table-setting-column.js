import BaseModel from "@kaspernj/api-maker/build/base-model.js"
import modelClassRequire from "@kaspernj/api-maker/build/model-class-require.js"

const modelClassData = {
  "attributes": {
    "attribute_name": {
      "column": {
        "default": null,
        "name": "attribute_name",
        "null": true,
        "type": "string"
      },
      "name": "attribute_name",
      "selected_by_default": null,
      "translated": null
    },
    "id": {
      "column": {
        "default": null,
        "name": "id",
        "null": false,
        "type": "integer"
      },
      "name": "id",
      "selected_by_default": null,
      "translated": null
    },
    "identifier": {
      "column": {
        "default": null,
        "name": "identifier",
        "null": false,
        "type": "string"
      },
      "name": "identifier",
      "selected_by_default": null,
      "translated": null
    },
    "path": {
      "column": {
        "default": null,
        "name": "path",
        "null": true,
        "type": "text"
      },
      "name": "path",
      "selected_by_default": null,
      "translated": null
    },
    "position": {
      "column": {
        "default": null,
        "name": "position",
        "null": false,
        "type": "integer"
      },
      "name": "position",
      "selected_by_default": null,
      "translated": null
    },
    "sort_key": {
      "column": {
        "default": null,
        "name": "sort_key",
        "null": true,
        "type": "string"
      },
      "name": "sort_key",
      "selected_by_default": null,
      "translated": null
    },
    "visible": {
      "column": {
        "default": null,
        "name": "visible",
        "null": true,
        "type": "boolean"
      },
      "name": "visible",
      "selected_by_default": null,
      "translated": null
    },
    "width": {
      "column": {
        "default": null,
        "name": "width",
        "null": true,
        "type": "integer"
      },
      "name": "width",
      "selected_by_default": null,
      "translated": null
    }
  },
  "className": "ApiMakerTable::TableSettingColumn",
  "collectionKey": "api_maker_table/table_setting_columns",
  "collectionName": "table_setting_columns",
  "i18nKey": "api_maker_table/table_setting_column",
  "camelizedLower": "apiMakerTable::TableSettingColumn",
  "name": "TableSettingColumn",
  "nameDasherized": "table-setting-column",
  "pluralName": "api_maker_table_table_setting_columns",
  "ransackable_associations": [
    {
      "className": "TableSetting",
      "collectionName": "table_settings",
      "foreignKey": "table_setting_id",
      "name": "table_setting",
      "macro": "belongs_to",
      "resource_name": "TableSetting",
      "through": null
    }
  ],
  "ransackable_attributes": [
    {
      "name": "attribute_name",
      "column": {
        "default": null,
        "name": "attribute_name",
        "null": true,
        "type": "string"
      }
    },
    {
      "name": "created_at",
      "column": {
        "default": null,
        "name": "created_at",
        "null": false,
        "type": "datetime"
      }
    },
    {
      "name": "id",
      "column": {
        "default": null,
        "name": "id",
        "null": false,
        "type": "integer"
      }
    },
    {
      "name": "identifier",
      "column": {
        "default": null,
        "name": "identifier",
        "null": false,
        "type": "string"
      }
    },
    {
      "name": "path",
      "column": {
        "default": null,
        "name": "path",
        "null": true,
        "type": "text"
      }
    },
    {
      "name": "position",
      "column": {
        "default": null,
        "name": "position",
        "null": false,
        "type": "integer"
      }
    },
    {
      "name": "sort_key",
      "column": {
        "default": null,
        "name": "sort_key",
        "null": true,
        "type": "string"
      }
    },
    {
      "name": "table_setting_id",
      "column": {
        "default": null,
        "name": "table_setting_id",
        "null": false,
        "type": "integer"
      }
    },
    {
      "name": "updated_at",
      "column": {
        "default": null,
        "name": "updated_at",
        "null": false,
        "type": "datetime"
      }
    },
    {
      "name": "visible",
      "column": {
        "default": null,
        "name": "visible",
        "null": true,
        "type": "boolean"
      }
    },
    {
      "name": "width",
      "column": {
        "default": null,
        "name": "width",
        "null": true,
        "type": "integer"
      }
    }
  ],
  "ransackable_scopes": [

  ],
  "relationships": [
    {
      "className": "TableSetting",
      "collectionName": "table_settings",
      "foreignKey": "table_setting_id",
      "name": "table_setting",
      "macro": "belongs_to",
      "resource_name": "TableSetting",
      "through": null
    }
  ],
  "paramKey": "table_setting_column",
  "primaryKey": "id"
}

/** Frontend model for TableSettingColumn. */
class TableSettingColumn extends BaseModel {
  /** @returns {Record<string, any>} */
  static modelClassData() {
    return modelClassData
  }

  /** @returns {string | null} */
  attributeName() {
    return this.readAttributeUnderscore("attribute_name")
  }

  /** @returns {boolean} */
  hasAttributeName() {
    const value = this.attributeName()

    return this._isPresent(value)
  }

  /** @returns {number} */
  id() {
    return this.readAttributeUnderscore("id")
  }

  /** @returns {boolean} */
  hasId() {
    const value = this.id()

    return this._isPresent(value)
  }

  /** @returns {string} */
  identifier() {
    return this.readAttributeUnderscore("identifier")
  }

  /** @returns {boolean} */
  hasIdentifier() {
    const value = this.identifier()

    return this._isPresent(value)
  }

  /** @returns {string | null} */
  path() {
    return this.readAttributeUnderscore("path")
  }

  /** @returns {boolean} */
  hasPath() {
    const value = this.path()

    return this._isPresent(value)
  }

  /** @returns {number} */
  position() {
    return this.readAttributeUnderscore("position")
  }

  /** @returns {boolean} */
  hasPosition() {
    const value = this.position()

    return this._isPresent(value)
  }

  /** @returns {string | null} */
  sortKey() {
    return this.readAttributeUnderscore("sort_key")
  }

  /** @returns {boolean} */
  hasSortKey() {
    const value = this.sortKey()

    return this._isPresent(value)
  }

  /** @returns {boolean | null} */
  visible() {
    return this.readAttributeUnderscore("visible")
  }

  /** @returns {boolean} */
  hasVisible() {
    const value = this.visible()

    return this._isPresent(value)
  }

  /** @returns {number | null} */
  width() {
    return this.readAttributeUnderscore("width")
  }

  /** @returns {boolean} */
  hasWidth() {
    const value = this.width()

    return this._isPresent(value)
  }

  /** @returns {import("./table-setting.js").default | null} */
  tableSetting() {
    return this._readBelongsToReflection({reflectionName: "table_setting"})
  }

  /** @returns {Promise<import("./table-setting.js").default | null>} */
  loadTableSetting() {
    if (!("tableSettingId" in this)) throw new Error("Foreign key method wasn't defined: tableSettingId")

    const id = this.tableSettingId()
    const modelClass = modelClassRequire("TableSetting")
    const ransack = {}

    ransack["id_eq"] = id

    return this._loadBelongsToReflection(
      {reflectionName: "table_setting", model: this, modelClass},
      {ransack}
    )
  }
}

export default TableSettingColumn
