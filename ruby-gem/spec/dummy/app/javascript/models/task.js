import BaseModel from "@kaspernj/api-maker/build/base-model.js"
import Collection from "@kaspernj/api-maker/build/collection.js"
import modelClassRequire from "@kaspernj/api-maker/build/model-class-require.js"

const modelClassData = {
  "attributes": {
    "custom_id": {
      "column": null,
      "name": "custom_id",
      "selected_by_default": null,
      "translated": null
    },
    "finished": {
      "column": {
        "default": "0",
        "name": "finished",
        "null": false,
        "type": "boolean"
      },
      "name": "finished",
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
    "priority": {
      "column": {
        "default": null,
        "name": "priority",
        "null": true,
        "type": "integer"
      },
      "name": "priority",
      "selected_by_default": null,
      "translated": null
    },
    "project_id": {
      "column": {
        "default": null,
        "name": "project_id",
        "null": false,
        "type": "integer"
      },
      "name": "project_id",
      "selected_by_default": null,
      "translated": null
    },
    "state": {
      "column": {
        "default": "open",
        "name": "state",
        "null": false,
        "type": "string"
      },
      "name": "state",
      "selected_by_default": null,
      "translated": null
    },
    "translated_state": {
      "column": null,
      "name": "translated_state",
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
    }
  },
  "className": "Task",
  "collectionKey": "tasks",
  "collectionName": "tasks",
  "i18nKey": "task",
  "camelizedLower": "task",
  "name": "Task",
  "nameDasherized": "task",
  "pluralName": "tasks",
  "ransackable_associations": [
    {
      "className": "Account",
      "collectionName": "accounts",
      "foreignKey": "account_id",
      "name": "account",
      "macro": "has_one",
      "resource_name": "Account",
      "through": "project"
    },
    {
      "className": "Customer",
      "collectionName": "customers",
      "foreignKey": "customer_id",
      "name": "account_customer",
      "macro": "has_one",
      "resource_name": "Customer",
      "through": "account"
    },
    {
      "className": "AccountMarkedTask",
      "collectionName": "account_marked_tasks",
      "foreignKey": "task_id",
      "name": "account_marked_tasks",
      "macro": "has_many",
      "resource_name": "AccountMarkedTask",
      "through": null
    },
    {
      "className": "Account",
      "collectionName": "accounts",
      "foreignKey": "account_id",
      "name": "accounts",
      "macro": "has_many",
      "resource_name": "Account",
      "through": "account_marked_tasks"
    },
    {
      "className": "Comment",
      "collectionName": "comments",
      "foreignKey": "resource_id",
      "name": "comment",
      "macro": "has_one",
      "resource_name": "Comment",
      "through": null
    },
    {
      "className": "Comment",
      "collectionName": "comments",
      "foreignKey": "resource_id",
      "name": "comments",
      "macro": "has_many",
      "resource_name": "Comment",
      "through": null
    },
    {
      "className": "Customer",
      "collectionName": "customers",
      "foreignKey": "customer_id",
      "name": "customer",
      "macro": "has_one",
      "resource_name": "Customer",
      "through": "account"
    },
    {
      "className": "Project",
      "collectionName": "projects",
      "foreignKey": "project_id",
      "name": "project",
      "macro": "belongs_to",
      "resource_name": "Project",
      "through": null
    },
    {
      "className": "ProjectDetail",
      "collectionName": "project_details",
      "foreignKey": "project_id",
      "name": "project_detail",
      "macro": "has_one",
      "resource_name": "ProjectDetail",
      "through": "project"
    },
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
      "name": "finished",
      "column": {
        "default": "0",
        "name": "finished",
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
      "name": "name",
      "column": {
        "default": null,
        "name": "name",
        "null": false,
        "type": "string"
      }
    },
    {
      "name": "priority",
      "column": {
        "default": null,
        "name": "priority",
        "null": true,
        "type": "integer"
      }
    },
    {
      "name": "project_id",
      "column": {
        "default": null,
        "name": "project_id",
        "null": false,
        "type": "integer"
      }
    },
    {
      "name": "state",
      "column": {
        "default": "open",
        "name": "state",
        "null": false,
        "type": "string"
      }
    },
    {
      "name": "support_email",
      "column": {
        "default": null,
        "name": "support_email",
        "null": true,
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
        "null": true,
        "type": "integer"
      }
    }
  ],
  "ransackable_scopes": [
    {
      "name": "some_name_contains"
    }
  ],
  "relationships": [
    {
      "className": "Account",
      "collectionName": "accounts",
      "foreignKey": "account_id",
      "name": "account",
      "macro": "has_one",
      "resource_name": "Account",
      "through": "project"
    },
    {
      "className": "Customer",
      "collectionName": "customers",
      "foreignKey": "customer_id",
      "name": "account_customer",
      "macro": "has_one",
      "resource_name": "Customer",
      "through": "account"
    },
    {
      "className": "Comment",
      "collectionName": "comments",
      "foreignKey": "resource_id",
      "name": "comments",
      "macro": "has_many",
      "resource_name": "Comment",
      "through": null
    },
    {
      "className": "Project",
      "collectionName": "projects",
      "foreignKey": "project_id",
      "name": "project",
      "macro": "belongs_to",
      "resource_name": "Project",
      "through": null
    },
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
  "paramKey": "task",
  "primaryKey": "id"
}

/** Frontend model for Task. */
class Task extends BaseModel {
  /** @returns {Record<string, any>} */
  static modelClassData() {
    return modelClassData
  }

  /** @returns {any} */
  customId() {
    return this.readAttributeUnderscore("custom_id")
  }

  /** @returns {boolean} */
  hasCustomId() {
    const value = this.customId()

    return this._isPresent(value)
  }

  /** @returns {boolean} */
  finished() {
    return this.readAttributeUnderscore("finished")
  }

  /** @returns {boolean} */
  hasFinished() {
    const value = this.finished()

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

  /** @returns {number | null} */
  priority() {
    return this.readAttributeUnderscore("priority")
  }

  /** @returns {boolean} */
  hasPriority() {
    const value = this.priority()

    return this._isPresent(value)
  }

  /** @returns {number} */
  projectId() {
    return this.readAttributeUnderscore("project_id")
  }

  /** @returns {boolean} */
  hasProjectId() {
    const value = this.projectId()

    return this._isPresent(value)
  }

  /** @returns {string} */
  state() {
    return this.readAttributeUnderscore("state")
  }

  /** @returns {boolean} */
  hasState() {
    const value = this.state()

    return this._isPresent(value)
  }

  /** @returns {any} */
  translatedState() {
    return this.readAttributeUnderscore("translated_state")
  }

  /** @returns {boolean} */
  hasTranslatedState() {
    const value = this.translatedState()

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

  /** @returns {string} */
  createdAt() {
    return this.readAttributeUnderscore("created_at")
  }

  /** @returns {boolean} */
  hasCreatedAt() {
    const value = this.createdAt()

    return this._isPresent(value)
  }

  /**
   * @template TCommandResponse
   * @param {Record<string, any> | HTMLFormElement | FormData} args
   * @param {Record<string, any>} [commandArgs]
   * @returns {Promise<TCommandResponse>}
   */
  static commandSerialize(args, commandArgs = {}) {
    return /** @type {Promise<TCommandResponse>} */ (this._callCollectionCommand(
      {
        args,
        command: "command_serialize",
        collectionName: "tasks",
        type: "collection"
      },
      commandArgs
    ))
  }

  /**
   * @template TCommandResponse
   * @param {Record<string, any> | HTMLFormElement | FormData} args
   * @param {Record<string, any>} [commandArgs]
   * @returns {Promise<TCommandResponse>}
   */
  static testCollection(args, commandArgs = {}) {
    return /** @type {Promise<TCommandResponse>} */ (this._callCollectionCommand(
      {
        args,
        command: "test_collection",
        collectionName: "tasks",
        type: "collection"
      },
      commandArgs
    ))
  }

  /**
   * @template TCommandResponse
   * @param {Record<string, any> | HTMLFormElement | FormData} args
   * @param {Record<string, any>} [commandArgs]
   * @returns {Promise<TCommandResponse>}
   */
  testMember(args, commandArgs = {}) {
    return /** @type {Promise<TCommandResponse>} */ (this._callMemberCommand(
      {
        args,
        command: "test_member",
        primaryKey: this.primaryKey(),
        collectionName: "tasks",
        type: "member"
      },
      commandArgs
    ))
  }

  /** @returns {import("./account.js").default | null} */
  account() {
    return this._readHasOneReflection({reflectionName: "account"})
  }

  /** @returns {Promise<import("./account.js").default | null>} */
  loadAccount() {
    if (!("id" in this)) throw new Error("Primary key method wasn't defined: id")

    const id = this.id()
    const modelClass = modelClassRequire("Account")

    return this._loadHasOneReflection(
      {reflectionName: "account", model: this, modelClass},
      {
        params: {
          through: {
            model: "Task",
            id,
            reflection: "account"
          }
        }
      }
    )
  }

  /** @returns {import("./customer.js").default | null} */
  accountCustomer() {
    return this._readHasOneReflection({reflectionName: "account_customer"})
  }

  /** @returns {Promise<import("./customer.js").default | null>} */
  loadAccountCustomer() {
    if (!("id" in this)) throw new Error("Primary key method wasn't defined: id")

    const id = this.id()
    const modelClass = modelClassRequire("Customer")

    return this._loadHasOneReflection(
      {reflectionName: "account_customer", model: this, modelClass},
      {
        params: {
          through: {
            model: "Task",
            id,
            reflection: "account_customer"
          }
        }
      }
    )
  }

  /** @returns {import("@kaspernj/api-maker/build/collection.js").default<typeof import("./comment.js").default>} */
  comments() {
    if (!("id" in this)) throw new Error("No such primary key method: id")

    const modelClass = modelClassRequire("Comment")

    const ransack = {}

    ransack["resource_id_eq"] = this.id()
    ransack["resource_type_eq"] = "Task"

    return new Collection(
      {
        reflectionName: "comments",
        model: this,
        modelName: "Comment",
        modelClass
      },
      {ransack}
    )
  }

  /** @returns {Promise<Array<import("./comment.js").default>>} */
  loadComments() {
    if (!("id" in this)) throw new Error("No such primary key method: id")

    const modelClass = modelClassRequire("Comment")

    const ransack = {}

    ransack["resource_id_eq"] = this.id()
    ransack["resource_type_eq"] = "Task"

    return this._loadHasManyReflection(
      {
        reflectionName: "comments",
        model: this,
        modelClass
      },
      {ransack}
    )
  }

  /** @returns {import("./project.js").default | null} */
  project() {
    return this._readBelongsToReflection({reflectionName: "project"})
  }

  /** @returns {Promise<import("./project.js").default | null>} */
  loadProject() {
    if (!("projectId" in this)) throw new Error("Foreign key method wasn't defined: projectId")

    const id = this.projectId()
    const modelClass = modelClassRequire("Project")
    const ransack = {}

    ransack["id_eq"] = id

    return this._loadBelongsToReflection(
      {reflectionName: "project", model: this, modelClass},
      {ransack}
    )
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

export default Task
