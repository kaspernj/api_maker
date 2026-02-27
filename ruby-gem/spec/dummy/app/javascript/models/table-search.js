import BaseModel from "../base-model.js"

const modelClassData = {
  "attributes": {
    "created_at": {
      "column": {
        "default": null,
        "name": "created_at",
        "null": false,
        "type": "datetime"
      },
      "name": "created_at",
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
    "name": {
      "column": {
        "default": null,
        "name": "name",
        "null": false,
        "type": "string"
      },
      "name": "name",
      "selected_by_default": null,
      "translated": null
    },
    "public": {
      "column": {
        "default": "0",
        "name": "public",
        "null": false,
        "type": "boolean"
      },
      "name": "public",
      "selected_by_default": null,
      "translated": null
    },
    "query_params": {
      "column": {
        "default": null,
        "name": "query_params",
        "null": false,
        "type": "text"
      },
      "name": "query_params",
      "selected_by_default": null,
      "translated": null
    },
    "updated_at": {
      "column": {
        "default": null,
        "name": "updated_at",
        "null": false,
        "type": "datetime"
      },
      "name": "updated_at",
      "selected_by_default": null,
      "translated": null
    },
    "user_id": {
      "column": {
        "default": null,
        "name": "user_id",
        "null": true,
        "type": "integer"
      },
      "name": "user_id",
      "selected_by_default": null,
      "translated": null
    },
    "user_type": {
      "column": {
        "default": null,
        "name": "user_type",
        "null": true,
        "type": "string"
      },
      "name": "user_type",
      "selected_by_default": null,
      "translated": null
    }
  },
  "className": "ApiMakerTable::TableSearch",
  "collectionKey": "api_maker_table/table_searches",
  "collectionName": "table_searches",
  "i18nKey": "api_maker_table/table_search",
  "camelizedLower": "apiMakerTable::TableSearch",
  "name": "TableSearch",
  "nameDasherized": "table-search",
  "pluralName": "api_maker_table_table_searches",
  "ransackable_associations": [
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
      "name": "id",
      "column": {
        "default": null,
        "name": "id",
        "null": false,
        "type": "integer"
      }
    },
    {
      "name": "name",
      "column": {
        "default": null,
        "name": "name",
        "null": false,
        "type": "string"
      }
    },
    {
      "name": "public",
      "column": {
        "default": "0",
        "name": "public",
        "null": false,
        "type": "boolean"
      }
    },
    {
      "name": "query_params",
      "column": {
        "default": null,
        "name": "query_params",
        "null": false,
        "type": "text"
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
        "null": true,
        "type": "integer"
      }
    },
    {
      "name": "user_type",
      "column": {
        "default": null,
        "name": "user_type",
        "null": true,
        "type": "string"
      }
    }
  ],
  "ransackable_scopes": [

  ],
  "relationships": [

  ],
  "paramKey": "table_search",
  "primaryKey": "id"
}

/** Frontend model for TableSearch. */
class TableSearch extends BaseModel {
  /** @returns {Record<string, any>} */
  static modelClassData() {
    return modelClassData
  }

  /** @returns {string} */
  createdAt() {
    return this.readAttributeUnderscore("created_at")
  }

  /** @returns {boolean} */
  hasCreatedAt() {
    const value = this.createdAt()

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
  name() {
    return this.readAttributeUnderscore("name")
  }

  /** @returns {boolean} */
  hasName() {
    const value = this.name()

    return this._isPresent(value)
  }

  /** @returns {boolean} */
  public() {
    return this.readAttributeUnderscore("public")
  }

  /** @returns {boolean} */
  hasPublic() {
    const value = this.public()

    return this._isPresent(value)
  }

  /** @returns {string} */
  queryParams() {
    return this.readAttributeUnderscore("query_params")
  }

  /** @returns {boolean} */
  hasQueryParams() {
    const value = this.queryParams()

    return this._isPresent(value)
  }

  /** @returns {string} */
  updatedAt() {
    return this.readAttributeUnderscore("updated_at")
  }

  /** @returns {boolean} */
  hasUpdatedAt() {
    const value = this.updatedAt()

    return this._isPresent(value)
  }

  /** @returns {number | null} */
  userId() {
    return this.readAttributeUnderscore("user_id")
  }

  /** @returns {boolean} */
  hasUserId() {
    const value = this.userId()

    return this._isPresent(value)
  }

  /** @returns {string | null} */
  userType() {
    return this.readAttributeUnderscore("user_type")
  }

  /** @returns {boolean} */
  hasUserType() {
    const value = this.userType()

    return this._isPresent(value)
  }
}

export default TableSearch
