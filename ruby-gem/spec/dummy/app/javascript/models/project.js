import BaseModel from "../base-model.js"
import Collection from "../collection.js"
import ProjectDetail from "./project-detail.js"
import Task from "./task.js"

const modelClassData = {
  "attributes": {
    "account_id": {
      "column": {
        "default": null,
        "name": "account_id",
        "null": true,
        "type": "integer"
      },
      "name": "account_id",
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
    "illegal": {
      "column": {
        "default": "0",
        "name": "illegal",
        "null": false,
        "type": "boolean"
      },
      "name": "illegal",
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
    "price_per_hour": {
      "column": null,
      "name": "price_per_hour",
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
    }
  },
  "className": "Project",
  "collectionKey": "projects",
  "collectionName": "projects",
  "i18nKey": "project",
  "camelizedLower": "project",
  "name": "Project",
  "nameDasherized": "project",
  "pluralName": "projects",
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
      "className": "Customer",
      "collectionName": "customers",
      "foreignKey": "customer_id",
      "name": "customer",
      "macro": "has_one",
      "resource_name": "Customer",
      "through": "account"
    },
    {
      "className": "ProjectDetail",
      "collectionName": "project_details",
      "foreignKey": "project_id",
      "name": "project_detail",
      "macro": "has_one",
      "resource_name": "ProjectDetail",
      "through": null
    },
    {
      "className": "ProjectSecret",
      "collectionName": null,
      "foreignKey": "project_id",
      "name": "project_secrets",
      "macro": "has_many",
      "resource_name": null,
      "through": null
    },
    {
      "className": "Task",
      "collectionName": "tasks",
      "foreignKey": "project_id",
      "name": "tasks",
      "macro": "has_many",
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
        "null": true,
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
      "name": "illegal",
      "column": {
        "default": "0",
        "name": "illegal",
        "null": false,
        "type": "boolean"
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
      "name": "price_per_hour_cents",
      "column": {
        "default": null,
        "name": "price_per_hour_cents",
        "null": true,
        "type": "integer"
      }
    },
    {
      "name": "price_per_hour_currency",
      "column": {
        "default": null,
        "name": "price_per_hour_currency",
        "null": true,
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
      "className": "ProjectDetail",
      "collectionName": "project_details",
      "foreignKey": "project_id",
      "name": "project_detail",
      "macro": "has_one",
      "resource_name": "ProjectDetail",
      "through": null
    },
    {
      "className": "Task",
      "collectionName": "tasks",
      "foreignKey": "project_id",
      "name": "tasks",
      "macro": "has_many",
      "resource_name": "Task",
      "through": null
    }
  ],
  "paramKey": "project",
  "primaryKey": "id"
}

/** Frontend model for Project. */
class Project extends BaseModel {
  /** @returns {Record<string, any>} */
  static modelClassData() {
    return modelClassData
  }

  /** @returns {number | null} */
  accountId() {
    return this.readAttributeUnderscore("account_id")
  }

  /** @returns {boolean} */
  hasAccountId() {
    const value = this.accountId()

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

  /** @returns {number} */
  id() {
    return this.readAttributeUnderscore("id")
  }

  /** @returns {boolean} */
  hasId() {
    const value = this.id()

    return this._isPresent(value)
  }

  /** @returns {boolean} */
  illegal() {
    return this.readAttributeUnderscore("illegal")
  }

  /** @returns {boolean} */
  hasIllegal() {
    const value = this.illegal()

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

  /** @returns {any} */
  pricePerHour() {
    return this.readAttributeUnderscore("price_per_hour")
  }

  /** @returns {boolean} */
  hasPricePerHour() {
    const value = this.pricePerHour()

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

  /**
   * @template TCommandResponse
   * @param {Record<string, any> | HTMLFormElement | FormData} args
   * @param {Record<string, any>} [commandArgs]
   * @returns {Promise<TCommandResponse>}
   */
  static createProject(args, commandArgs = {}) {
    return /** @type {Promise<TCommandResponse>} */ (this._callCollectionCommand(
      {
        args,
        command: "create_project",
        collectionName: "projects",
        type: "collection"
      },
      commandArgs
    ))
  }

  /** @returns {ProjectDetail | null} */
  projectDetail() {
    return this._readHasOneReflection({reflectionName: "project_detail"})
  }

  /** @returns {Promise<ProjectDetail | null>} */
  loadProjectDetail() {
    if (!("id" in this)) throw new Error("Primary key method wasn't defined: id")

    const id = this.id()
    const ransack = {}

    ransack["project_id_eq"] = id

    return this._loadHasOneReflection(
      {
        reflectionName: "project_detail",
        model: this,
        modelClass: ProjectDetail
      },
      {ransack}
    )
  }

  /** @returns {import("../collection.js").default<typeof Task>} */
  tasks() {
    if (!("id" in this)) throw new Error("No such primary key method: id")

    const ransack = {}

    ransack["project_id_eq"] = this.id()

    return new Collection(
      {
        reflectionName: "tasks",
        model: this,
        modelName: "Task",
        modelClass: Task
      },
      {ransack}
    )
  }

  /** @returns {Promise<Array<Task>>} */
  loadTasks() {
    const ransack = {}

    ransack["project_id_eq"] = this.primaryKey()

    return this._loadHasManyReflection(
      {
        reflectionName: "tasks",
        model: this,
        modelClass: Task
      },
      {ransack}
    )
  }
}

export default Project
