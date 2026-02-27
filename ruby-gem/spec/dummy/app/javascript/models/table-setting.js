import BaseModel from "../base-model.js"
import Collection from "../collection.js"
import TableSettingColumn from "./table-setting-column.js"

const modelClassData = {
  "attributes": {
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
    }
  },
  "className": "ApiMakerTable::TableSetting",
  "collectionKey": "api_maker_table/table_settings",
  "collectionName": "table_settings",
  "i18nKey": "api_maker_table/table_setting",
  "camelizedLower": "apiMakerTable::TableSetting",
  "name": "TableSetting",
  "nameDasherized": "table-setting",
  "pluralName": "api_maker_table_table_settings",
  "ransackable_associations": [
    {
      "className": "ApiMakerTable::TableSettingColumn",
      "collectionName": "table_setting_columns",
      "foreignKey": "table_setting_id",
      "name": "columns",
      "macro": "has_many",
      "resource_name": "TableSettingColumn",
      "through": null
    },
    {
      "className": "User",
      "collectionName": null,
      "foreignKey": "user_id",
      "name": "user",
      "macro": "belongs_to",
      "resource_name": null,
      "through": null
    }
  ],
  "ransackable_attributes": [
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
      "name": "fixed_table_layout",
      "column": {
        "default": "0",
        "name": "fixed_table_layout",
        "null": false,
        "type": "boolean"
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
      "name": "updated_at",
      "column": {
        "default": null,
        "name": "updated_at",
        "null": false,
        "type": "datetime"
      }
    },
    {
      "name": "user_id",
      "column": {
        "default": null,
        "name": "user_id",
        "null": false,
        "type": "integer"
      }
    },
    {
      "name": "user_type",
      "column": {
        "default": null,
        "name": "user_type",
        "null": false,
        "type": "string"
      }
    }
  ],
  "ransackable_scopes": [

  ],
  "relationships": [
    {
      "className": "ApiMakerTable::TableSettingColumn",
      "collectionName": "table_setting_columns",
      "foreignKey": "table_setting_id",
      "name": "columns",
      "macro": "has_many",
      "resource_name": "TableSettingColumn",
      "through": null
    }
  ],
  "paramKey": "table_setting",
  "primaryKey": "id"
}

/** Frontend model for TableSetting. */
class TableSetting extends BaseModel {
  /** @returns {Record<string, any>} */
  static modelClassData() {
    return modelClassData
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

  /** @returns {import("../collection.js").default<typeof TableSettingColumn>} */
  columns() {
    if (!("id" in this)) throw new Error("No such primary key method: id")

    const ransack = {}

    ransack["table_setting_id_eq"] = this.id()

    return new Collection(
      {
        reflectionName: "columns",
        model: this,
        modelName: "ApiMakerTable::TableSettingColumn",
        modelClass: TableSettingColumn
      },
      {ransack}
    )
  }

  /** @returns {Promise<Array<TableSettingColumn>>} */
  loadColumns() {
    const ransack = {}

    ransack["table_setting_id_eq"] = this.primaryKey()

    return this._loadHasManyReflection(
      {
        reflectionName: "columns",
        model: this,
        modelClass: TableSettingColumn
      },
      {ransack}
    )
  }
}

export default TableSetting
