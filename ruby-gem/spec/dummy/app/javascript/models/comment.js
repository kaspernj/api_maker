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
    "comment": {
      "column": {
        "default": null,
        "name": "comment",
        "null": false,
        "type": "text"
      },
      "name": "comment",
      "selected_by_default": null,
      "translated": null
    }
  },
  "className": "Comment",
  "collectionKey": "comments",
  "collectionName": "comments",
  "i18nKey": "comment",
  "camelizedLower": "comment",
  "name": "Comment",
  "nameDasherized": "comment",
  "pluralName": "comments",
  "ransackable_associations": [
    {
      "className": "User",
      "collectionName": "users",
      "foreignKey": "author_id",
      "name": "author",
      "macro": "belongs_to",
      "resource_name": "User",
      "through": null
    },
    {
      "className": "Resource",
      "collectionName": null,
      "foreignKey": "resource_id",
      "name": "resource",
      "macro": "belongs_to",
      "resource_name": null,
      "through": null
    }
  ],
  "ransackable_attributes": [
    {
      "name": "author_id",
      "column": {
        "default": null,
        "name": "author_id",
        "null": false,
        "type": "integer"
      }
    },
    {
      "name": "comment",
      "column": {
        "default": null,
        "name": "comment",
        "null": false,
        "type": "text"
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
      "name": "resource_id",
      "column": {
        "default": null,
        "name": "resource_id",
        "null": false,
        "type": "integer"
      }
    },
    {
      "name": "resource_type",
      "column": {
        "default": null,
        "name": "resource_type",
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
    }
  ],
  "ransackable_scopes": [

  ],
  "relationships": [
    {
      "className": "User",
      "collectionName": "users",
      "foreignKey": "author_id",
      "name": "author",
      "macro": "belongs_to",
      "resource_name": "User",
      "through": null
    }
  ],
  "paramKey": "comment",
  "primaryKey": "id"
}

/** Frontend model for Comment. */
class Comment extends BaseModel {
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
  comment() {
    return this.readAttributeUnderscore("comment")
  }

  /** @returns {boolean} */
  hasComment() {
    const value = this.comment()

    return this._isPresent(value)
  }

  /** @returns {import("./user.js").default | null} */
  author() {
    return this._readBelongsToReflection({reflectionName: "author"})
  }

  /** @returns {Promise<import("./user.js").default | null>} */
  loadAuthor() {
    if (!("authorId" in this)) throw new Error("Foreign key method wasn't defined: authorId")

    const id = this.authorId()
    const modelClass = modelClassRequire("User")
    const ransack = {}

    ransack["id_eq"] = id

    return this._loadBelongsToReflection(
      {reflectionName: "author", model: this, modelClass},
      {ransack}
    )
  }
}

export default Comment
