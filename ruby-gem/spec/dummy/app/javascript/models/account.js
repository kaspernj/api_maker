import BaseModel from "../base-model.js"
import Collection from "../collection.js"
import Project from "./project.js"
import Task from "./task.js"

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
    "name": {
      "column": {
        "default": null,
        "name": "name",
        "null": true,
        "type": "string"
      },
      "name": "name",
      "selected_by_default": null,
      "translated": null
    },
    "users_count": {
      "column": null,
      "name": "users_count",
      "selected_by_default": false,
      "translated": null
    }
  },
  "className": "Account",
  "collectionKey": "accounts",
  "collectionName": "accounts",
  "i18nKey": "account",
  "camelizedLower": "account",
  "name": "Account",
  "nameDasherized": "account",
  "pluralName": "accounts",
  "ransackable_associations": [
    {
      "className": "AccountMarkedTask",
      "collectionName": "account_marked_tasks",
      "foreignKey": "account_id",
      "name": "account_marked_tasks",
      "macro": "has_many",
      "resource_name": "AccountMarkedTask",
      "through": null
    },
    {
      "className": "Customer",
      "collectionName": "customers",
      "foreignKey": "parent_id",
      "name": "commune",
      "macro": "has_one",
      "resource_name": "Customer",
      "through": "customer"
    },
    {
      "className": "Customer",
      "collectionName": "customers",
      "foreignKey": "customer_id",
      "name": "customer",
      "macro": "belongs_to",
      "resource_name": "Customer",
      "through": null
    },
    {
      "className": "ProjectDetail",
      "collectionName": "project_details",
      "foreignKey": "project_id",
      "name": "project_details",
      "macro": "has_many",
      "resource_name": "ProjectDetail",
      "through": "projects"
    },
    {
      "className": "Task",
      "collectionName": "tasks",
      "foreignKey": "project_id",
      "name": "project_tasks",
      "macro": "has_many",
      "resource_name": "Task",
      "through": "projects"
    },
    {
      "className": "Project",
      "collectionName": "projects",
      "foreignKey": "account_id",
      "name": "projects",
      "macro": "has_many",
      "resource_name": "Project",
      "through": null
    },
    {
      "className": "Task",
      "collectionName": "tasks",
      "foreignKey": "task_id",
      "name": "tasks",
      "macro": "has_many",
      "resource_name": "Task",
      "through": "account_marked_tasks"
    },
    {
      "className": "User",
      "collectionName": "users",
      "foreignKey": "user_id",
      "name": "users",
      "macro": "has_many",
      "resource_name": "User",
      "through": "tasks"
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
      "name": "customer_id",
      "column": {
        "default": null,
        "name": "customer_id",
        "null": true,
        "type": "integer"
      }
    },
    {
      "name": "deleted_at",
      "column": {
        "default": null,
        "name": "deleted_at",
        "null": true,
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
    }
  ],
  "ransackable_scopes": [

  ],
  "relationships": [
    {
      "className": "Project",
      "collectionName": "projects",
      "foreignKey": "account_id",
      "name": "projects",
      "macro": "has_many",
      "resource_name": "Project",
      "through": null
    },
    {
      "className": "Task",
      "collectionName": "tasks",
      "foreignKey": "task_id",
      "name": "tasks",
      "macro": "has_many",
      "resource_name": "Task",
      "through": "account_marked_tasks"
    }
  ],
  "paramKey": "account",
  "primaryKey": "id"
}

/** Frontend model for Account. */
class Account extends BaseModel {
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

  /** @returns {string | null} */
  name() {
    return this.readAttributeUnderscore("name")
  }

  /** @returns {boolean} */
  hasName() {
    const value = this.name()

    return this._isPresent(value)
  }

  /** @returns {any} */
  usersCount() {
    return this.readAttributeUnderscore("users_count")
  }

  /** @returns {boolean} */
  hasUsersCount() {
    const value = this.usersCount()

    return this._isPresent(value)
  }

  /** @returns {import("../collection.js").default<typeof Project>} */
  projects() {
    if (!("id" in this)) throw new Error("No such primary key method: id")

    const ransack = {}

    ransack["account_id_eq"] = this.id()

    return new Collection(
      {
        reflectionName: "projects",
        model: this,
        modelName: "Project",
        modelClass: Project
      },
      {ransack}
    )
  }

  /** @returns {Promise<Array<Project>>} */
  loadProjects() {
    const ransack = {}

    ransack["account_id_eq"] = this.primaryKey()

    return this._loadHasManyReflection(
      {
        reflectionName: "projects",
        model: this,
        modelClass: Project
      },
      {ransack}
    )
  }

  /** @returns {import("../collection.js").default<typeof Task>} */
  tasks() {
    return new Collection(
      {
        reflectionName: "tasks",
        model: this,
        modelName: "Task",
        modelClass: Task
      },
      {
        params: {
          through: {
            model: "Account",
            id: this.primaryKey(),
            reflection: "tasks"
          }
        }
      }
    )
  }

  /** @returns {Promise<Array<Task>>} */
  loadTasks() {
    return this._loadHasManyReflection(
      {
        reflectionName: "tasks",
        model: this,
        modelClass: Task
      },
      {
        params: {
          through: {
            model: "Account",
            id: this.primaryKey(),
            reflection: "tasks"
          }
        }
      }
    )
  }
}

export default Account
