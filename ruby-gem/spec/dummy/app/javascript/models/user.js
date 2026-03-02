import BaseModel from "@kaspernj/api-maker/build/base-model.js"
import Collection from "@kaspernj/api-maker/build/collection.js"
import modelClassRequire from "@kaspernj/api-maker/build/model-class-require.js"

const modelClassData = {
  "attributes": {
    "name": {
      "column": null,
      "name": "name",
      "selected_by_default": null,
      "translated": null
    },
    "birthday_at": {
      "column": {
        "default": null,
        "name": "birthday_at",
        "null": true,
        "type": "date"
      },
      "name": "birthday_at",
      "selected_by_default": null,
      "translated": null
    },
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
    "custom_attribute": {
      "column": null,
      "name": "custom_attribute",
      "selected_by_default": null,
      "translated": null
    },
    "email": {
      "column": {
        "default": "",
        "name": "email",
        "null": false,
        "type": "string"
      },
      "name": "email",
      "selected_by_default": null,
      "translated": null
    },
    "first_name": {
      "column": {
        "default": null,
        "name": "first_name",
        "null": true,
        "type": "string"
      },
      "name": "first_name",
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
    "last_name": {
      "column": {
        "default": null,
        "name": "last_name",
        "null": true,
        "type": "string"
      },
      "name": "last_name",
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
    }
  },
  "className": "User",
  "collectionKey": "users",
  "collectionName": "users",
  "i18nKey": "user",
  "camelizedLower": "user",
  "name": "User",
  "nameDasherized": "user",
  "pluralName": "users",
  "ransackable_associations": [
    {
      "className": "Comment",
      "collectionName": "comments",
      "foreignKey": "author_id",
      "name": "comments",
      "macro": "has_many",
      "resource_name": "Comment",
      "through": null
    },
    {
      "className": "WorkerPlugins::Workplace",
      "collectionName": "workplaces",
      "foreignKey": "current_workplace_id",
      "name": "current_workplace",
      "macro": "belongs_to",
      "resource_name": "Workplace",
      "through": null
    },
    {
      "className": "ActiveStorage::Attachment",
      "collectionName": null,
      "foreignKey": "record_id",
      "name": "image_attachment",
      "macro": "has_one",
      "resource_name": null,
      "through": null
    },
    {
      "className": "ActiveStorage::Blob",
      "collectionName": null,
      "foreignKey": "blob_id",
      "name": "image_blob",
      "macro": "has_one",
      "resource_name": null,
      "through": "image_attachment"
    },
    {
      "className": "Task",
      "collectionName": "tasks",
      "foreignKey": "support_email",
      "name": "supported_tasks",
      "macro": "has_many",
      "resource_name": "Task",
      "through": null
    },
    {
      "className": "Task",
      "collectionName": "tasks",
      "foreignKey": "user_id",
      "name": "tasks",
      "macro": "has_many",
      "resource_name": "Task",
      "through": null
    },
    {
      "className": "UserRole",
      "collectionName": "user_roles",
      "foreignKey": "user_id",
      "name": "user_roles",
      "macro": "has_many",
      "resource_name": "UserRole",
      "through": null
    }
  ],
  "ransackable_attributes": [
    {
      "name": "admin",
      "column": {
        "default": "0",
        "name": "admin",
        "null": false,
        "type": "boolean"
      }
    },
    {
      "name": "birthday_at",
      "column": {
        "default": null,
        "name": "birthday_at",
        "null": true,
        "type": "date"
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
      "name": "current_sign_in_at",
      "column": {
        "default": null,
        "name": "current_sign_in_at",
        "null": true,
        "type": "datetime"
      }
    },
    {
      "name": "current_sign_in_ip",
      "column": {
        "default": null,
        "name": "current_sign_in_ip",
        "null": true,
        "type": "string"
      }
    },
    {
      "name": "current_workplace_id",
      "column": {
        "default": null,
        "name": "current_workplace_id",
        "null": true,
        "type": "integer"
      }
    },
    {
      "name": "email",
      "column": {
        "default": "",
        "name": "email",
        "null": false,
        "type": "string"
      }
    },
    {
      "name": "encrypted_password",
      "column": {
        "default": "",
        "name": "encrypted_password",
        "null": false,
        "type": "string"
      }
    },
    {
      "name": "first_name",
      "column": {
        "default": null,
        "name": "first_name",
        "null": true,
        "type": "string"
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
      "name": "last_name",
      "column": {
        "default": null,
        "name": "last_name",
        "null": true,
        "type": "string"
      }
    },
    {
      "name": "last_sign_in_at",
      "column": {
        "default": null,
        "name": "last_sign_in_at",
        "null": true,
        "type": "datetime"
      }
    },
    {
      "name": "last_sign_in_ip",
      "column": {
        "default": null,
        "name": "last_sign_in_ip",
        "null": true,
        "type": "string"
      }
    },
    {
      "name": "remember_created_at",
      "column": {
        "default": null,
        "name": "remember_created_at",
        "null": true,
        "type": "datetime"
      }
    },
    {
      "name": "reset_password_sent_at",
      "column": {
        "default": null,
        "name": "reset_password_sent_at",
        "null": true,
        "type": "datetime"
      }
    },
    {
      "name": "reset_password_token",
      "column": {
        "default": null,
        "name": "reset_password_token",
        "null": true,
        "type": "string"
      }
    },
    {
      "name": "sign_in_count",
      "column": {
        "default": "0",
        "name": "sign_in_count",
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
    }
  ],
  "ransackable_scopes": [

  ],
  "relationships": [
    {
      "className": "Task",
      "collectionName": "tasks",
      "foreignKey": "support_email",
      "name": "supported_tasks",
      "macro": "has_many",
      "resource_name": "Task",
      "through": null
    },
    {
      "className": "Task",
      "collectionName": "tasks",
      "foreignKey": "user_id",
      "name": "tasks",
      "macro": "has_many",
      "resource_name": "Task",
      "through": null
    },
    {
      "className": "UserRole",
      "collectionName": "user_roles",
      "foreignKey": "user_id",
      "name": "user_roles",
      "macro": "has_many",
      "resource_name": "UserRole",
      "through": null
    }
  ],
  "paramKey": "user",
  "primaryKey": "id"
}

/** Frontend model for User. */
class User extends BaseModel {
  /** @returns {Record<string, any>} */
  static modelClassData() {
    return modelClassData
  }

  /** @returns {any} */
  name() {
    return this.readAttributeUnderscore("name")
  }

  /** @returns {boolean} */
  hasName() {
    const value = this.name()

    return this._isPresent(value)
  }

  /** @returns {string | null} */
  birthdayAt() {
    return this.readAttributeUnderscore("birthday_at")
  }

  /** @returns {boolean} */
  hasBirthdayAt() {
    const value = this.birthdayAt()

    return this._isPresent(value)
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

  /** @returns {any} */
  customAttribute() {
    return this.readAttributeUnderscore("custom_attribute")
  }

  /** @returns {boolean} */
  hasCustomAttribute() {
    const value = this.customAttribute()

    return this._isPresent(value)
  }

  /** @returns {string} */
  email() {
    return this.readAttributeUnderscore("email")
  }

  /** @returns {boolean} */
  hasEmail() {
    const value = this.email()

    return this._isPresent(value)
  }

  /** @returns {string | null} */
  firstName() {
    return this.readAttributeUnderscore("first_name")
  }

  /** @returns {boolean} */
  hasFirstName() {
    const value = this.firstName()

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

  /** @returns {string | null} */
  lastName() {
    return this.readAttributeUnderscore("last_name")
  }

  /** @returns {boolean} */
  hasLastName() {
    const value = this.lastName()

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

  /** @returns {import("@kaspernj/api-maker/build/collection.js").default<typeof import("./task.js").default>} */
  supportedTasks() {
    if (!("email" in this)) throw new Error("No such primary key method: email")

    const modelClass = modelClassRequire("Task")

    const ransack = {}

    ransack["support_email_eq"] = this.email()

    return new Collection(
      {
        reflectionName: "supported_tasks",
        model: this,
        modelName: "Task",
        modelClass
      },
      {ransack}
    )
  }

  /** @returns {Promise<Array<import("./task.js").default>>} */
  loadSupportedTasks() {
    if (!("email" in this)) throw new Error("No such primary key method: email")

    const modelClass = modelClassRequire("Task")

    const ransack = {}

    ransack["support_email_eq"] = this.email()

    return this._loadHasManyReflection(
      {
        reflectionName: "supported_tasks",
        model: this,
        modelClass
      },
      {ransack}
    )
  }

  /** @returns {import("@kaspernj/api-maker/build/collection.js").default<typeof import("./task.js").default>} */
  tasks() {
    if (!("id" in this)) throw new Error("No such primary key method: id")

    const modelClass = modelClassRequire("Task")

    const ransack = {}

    ransack["user_id_eq"] = this.id()

    return new Collection(
      {
        reflectionName: "tasks",
        model: this,
        modelName: "Task",
        modelClass
      },
      {ransack}
    )
  }

  /** @returns {Promise<Array<import("./task.js").default>>} */
  loadTasks() {
    if (!("id" in this)) throw new Error("No such primary key method: id")

    const modelClass = modelClassRequire("Task")

    const ransack = {}

    ransack["user_id_eq"] = this.id()

    return this._loadHasManyReflection(
      {
        reflectionName: "tasks",
        model: this,
        modelClass
      },
      {ransack}
    )
  }

  /** @returns {import("@kaspernj/api-maker/build/collection.js").default<typeof import("./user-role.js").default>} */
  userRoles() {
    if (!("id" in this)) throw new Error("No such primary key method: id")

    const modelClass = modelClassRequire("UserRole")

    const ransack = {}

    ransack["user_id_eq"] = this.id()

    return new Collection(
      {
        reflectionName: "user_roles",
        model: this,
        modelName: "UserRole",
        modelClass
      },
      {ransack}
    )
  }

  /** @returns {Promise<Array<import("./user-role.js").default>>} */
  loadUserRoles() {
    if (!("id" in this)) throw new Error("No such primary key method: id")

    const modelClass = modelClassRequire("UserRole")

    const ransack = {}

    ransack["user_id_eq"] = this.id()

    return this._loadHasManyReflection(
      {
        reflectionName: "user_roles",
        model: this,
        modelClass
      },
      {ransack}
    )
  }
}

export default User
