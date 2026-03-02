import BaseModel from "@kaspernj/api-maker/build/base-model.js"
import modelClassRequire from "@kaspernj/api-maker/build/model-class-require.js"

const modelClassData = {
  "attributes": {
    "account_id": {
      "column": {
        "default": null,
        "name": "account_id",
        "null": false,
        "type": "integer"
      },
      "name": "account_id",
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
    "task_id": {
      "column": {
        "default": null,
        "name": "task_id",
        "null": false,
        "type": "integer"
      },
      "name": "task_id",
      "selected_by_default": null,
      "translated": null
    }
  },
  "className": "AccountMarkedTask",
  "collectionKey": "account_marked_tasks",
  "collectionName": "account_marked_tasks",
  "i18nKey": "account_marked_task",
  "camelizedLower": "accountMarkedTask",
  "name": "AccountMarkedTask",
  "nameDasherized": "account-marked-task",
  "pluralName": "account_marked_tasks",
  "ransackable_associations": [
    {
      "className": "Account",
      "collectionName": "accounts",
      "foreignKey": "account_id",
      "name": "account",
      "macro": "belongs_to",
      "resource_name": "Account",
      "through": null
    },
    {
      "className": "Task",
      "collectionName": "tasks",
      "foreignKey": "task_id",
      "name": "task",
      "macro": "belongs_to",
      "resource_name": "Task",
      "through": null
    }
  ],
  "ransackable_attributes": [
    {
      "name": "account_id",
      "column": {
        "default": null,
        "name": "account_id",
        "null": false,
        "type": "integer"
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
      "name": "task_id",
      "column": {
        "default": null,
        "name": "task_id",
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
      "className": "Account",
      "collectionName": "accounts",
      "foreignKey": "account_id",
      "name": "account",
      "macro": "belongs_to",
      "resource_name": "Account",
      "through": null
    },
    {
      "className": "Task",
      "collectionName": "tasks",
      "foreignKey": "task_id",
      "name": "task",
      "macro": "belongs_to",
      "resource_name": "Task",
      "through": null
    }
  ],
  "paramKey": "account_marked_task",
  "primaryKey": "id"
}

/** Frontend model for AccountMarkedTask. */
class AccountMarkedTask extends BaseModel {
  /** @returns {Record<string, any>} */
  static modelClassData() {
    return modelClassData
  }

  /** @returns {number} */
  accountId() {
    return this.readAttributeUnderscore("account_id")
  }

  /** @returns {boolean} */
  hasAccountId() {
    const value = this.accountId()

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

  /** @returns {number} */
  taskId() {
    return this.readAttributeUnderscore("task_id")
  }

  /** @returns {boolean} */
  hasTaskId() {
    const value = this.taskId()

    return this._isPresent(value)
  }

  /** @returns {import("./account.js").default | null} */
  account() {
    return this._readBelongsToReflection({reflectionName: "account"})
  }

  /** @returns {Promise<import("./account.js").default | null>} */
  loadAccount() {
    if (!("accountId" in this)) throw new Error("Foreign key method wasn't defined: accountId")

    const id = this.accountId()
    const modelClass = modelClassRequire("Account")
    const ransack = {}

    ransack["id_eq"] = id

    return this._loadBelongsToReflection(
      {reflectionName: "account", model: this, modelClass},
      {ransack}
    )
  }

  /** @returns {import("./task.js").default | null} */
  task() {
    return this._readBelongsToReflection({reflectionName: "task"})
  }

  /** @returns {Promise<import("./task.js").default | null>} */
  loadTask() {
    if (!("taskId" in this)) throw new Error("Foreign key method wasn't defined: taskId")

    const id = this.taskId()
    const modelClass = modelClassRequire("Task")
    const ransack = {}

    ransack["id_eq"] = id

    return this._loadBelongsToReflection(
      {reflectionName: "task", model: this, modelClass},
      {ransack}
    )
  }
}

export default AccountMarkedTask
