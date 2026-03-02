import BaseModel from "@kaspernj/api-maker/build/base-model.js"
import modelClassRequire from "@kaspernj/api-maker/build/model-class-require.js"

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
    "role": {
      "column": {
        "default": null,
        "name": "role",
        "null": false,
        "type": "string"
      },
      "name": "role",
      "selected_by_default": null,
      "translated": null
    },
    "user_id": {
      "column": {
        "default": null,
        "name": "user_id",
        "null": false,
        "type": "integer"
      },
      "name": "user_id",
      "selected_by_default": null,
      "translated": null
    }
  },
  "className": "User::Role",
  "collectionKey": "user/roles",
  "collectionName": "user_roles",
  "i18nKey": "user/role",
  "camelizedLower": "user::Role",
  "name": "UserRole",
  "nameDasherized": "user-role",
  "pluralName": "user_roles",
  "ransackable_associations": [
    {
      "className": "User",
      "collectionName": "users",
      "foreignKey": "user_id",
      "name": "user",
      "macro": "belongs_to",
      "resource_name": "User",
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
      "name": "role",
      "column": {
        "default": null,
        "name": "role",
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
    }
  ],
  "ransackable_scopes": [

  ],
  "relationships": [
    {
      "className": "User",
      "collectionName": "users",
      "foreignKey": "user_id",
      "name": "user",
      "macro": "belongs_to",
      "resource_name": "User",
      "through": null
    }
  ],
  "paramKey": "user_role",
  "primaryKey": "id"
}

/** Frontend model for UserRole. */
class UserRole extends BaseModel {
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
  role() {
    return this.readAttributeUnderscore("role")
  }

  /** @returns {boolean} */
  hasRole() {
    const value = this.role()

    return this._isPresent(value)
  }

  /** @returns {number} */
  userId() {
    return this.readAttributeUnderscore("user_id")
  }

  /** @returns {boolean} */
  hasUserId() {
    const value = this.userId()

    return this._isPresent(value)
  }

  /** @returns {import("./user.js").default | null} */
  user() {
    return this._readBelongsToReflection({reflectionName: "user"})
  }

  /** @returns {Promise<import("./user.js").default | null>} */
  loadUser() {
    if (!("userId" in this)) throw new Error("Foreign key method wasn't defined: userId")

    const id = this.userId()
    const modelClass = modelClassRequire("User")
    const ransack = {}

    ransack["id_eq"] = id

    return this._loadBelongsToReflection(
      {reflectionName: "user", model: this, modelClass},
      {ransack}
    )
  }
}

export default UserRole
