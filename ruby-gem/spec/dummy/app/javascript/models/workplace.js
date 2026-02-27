import BaseModel from "../base-model.js"
import Collection from "../collection.js"
import WorkplaceLink from "./workplace-link.js"

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
    }
  },
  "className": "WorkerPlugins::Workplace",
  "collectionKey": "worker_plugins/workplaces",
  "collectionName": "workplaces",
  "i18nKey": "worker_plugins/workplace",
  "camelizedLower": "workerPlugins::Workplace",
  "name": "Workplace",
  "nameDasherized": "workplace",
  "pluralName": "worker_plugins_workplaces",
  "ransackable_associations": [
    {
      "className": "User",
      "collectionName": "users",
      "foreignKey": "user_id",
      "name": "user",
      "macro": "belongs_to",
      "resource_name": "User",
      "through": null
    },
    {
      "className": "WorkplaceLink",
      "collectionName": "workplace_links",
      "foreignKey": "workplace_id",
      "name": "workplace_links",
      "macro": "has_many",
      "resource_name": "WorkplaceLink",
      "through": null
    }
  ],
  "ransackable_attributes": [
    {
      "name": "active",
      "column": {
        "default": "0",
        "name": "active",
        "null": false,
        "type": "boolean"
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
      "name": "name",
      "column": {
        "default": null,
        "name": "name",
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
        "null": true,
        "type": "integer"
      }
    }
  ],
  "ransackable_scopes": [

  ],
  "relationships": [
    {
      "className": "WorkplaceLink",
      "collectionName": "workplace_links",
      "foreignKey": "workplace_id",
      "name": "workplace_links",
      "macro": "has_many",
      "resource_name": "WorkplaceLink",
      "through": null
    }
  ],
  "paramKey": "workplace",
  "primaryKey": "id"
}

/** Frontend model for Workplace. */
class Workplace extends BaseModel {
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

  /**
   * @template TCommandResponse
   * @param {Record<string, any> | HTMLFormElement | FormData} args
   * @param {Record<string, any>} [commandArgs]
   * @returns {Promise<TCommandResponse>}
   */
  static destroyLinks(args, commandArgs = {}) {
    return /** @type {Promise<TCommandResponse>} */ (this._callCollectionCommand(
      {
        args,
        command: "destroy_links",
        collectionName: "workplaces",
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
  static createLink(args, commandArgs = {}) {
    return /** @type {Promise<TCommandResponse>} */ (this._callCollectionCommand(
      {
        args,
        command: "create_link",
        collectionName: "workplaces",
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
  static current(args, commandArgs = {}) {
    return /** @type {Promise<TCommandResponse>} */ (this._callCollectionCommand(
      {
        args,
        command: "current",
        collectionName: "workplaces",
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
  static linkFor(args, commandArgs = {}) {
    return /** @type {Promise<TCommandResponse>} */ (this._callCollectionCommand(
      {
        args,
        command: "link_for",
        collectionName: "workplaces",
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
  static switchQueryOnWorkplace(args, commandArgs = {}) {
    return /** @type {Promise<TCommandResponse>} */ (this._callCollectionCommand(
      {
        args,
        command: "switch_query_on_workplace",
        collectionName: "workplaces",
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
  addQuery(args, commandArgs = {}) {
    return /** @type {Promise<TCommandResponse>} */ (this._callMemberCommand(
      {
        args,
        command: "add_query",
        primaryKey: this.primaryKey(),
        collectionName: "workplaces",
        type: "member"
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
  deleteAllLinks(args, commandArgs = {}) {
    return /** @type {Promise<TCommandResponse>} */ (this._callMemberCommand(
      {
        args,
        command: "delete_all_links",
        primaryKey: this.primaryKey(),
        collectionName: "workplaces",
        type: "member"
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
  queryLinksStatus(args, commandArgs = {}) {
    return /** @type {Promise<TCommandResponse>} */ (this._callMemberCommand(
      {
        args,
        command: "query_links_status",
        primaryKey: this.primaryKey(),
        collectionName: "workplaces",
        type: "member"
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
  removeQuery(args, commandArgs = {}) {
    return /** @type {Promise<TCommandResponse>} */ (this._callMemberCommand(
      {
        args,
        command: "remove_query",
        primaryKey: this.primaryKey(),
        collectionName: "workplaces",
        type: "member"
      },
      commandArgs
    ))
  }

  /** @returns {import("../collection.js").default<typeof WorkplaceLink>} */
  workplaceLinks() {
    if (!("id" in this)) throw new Error("No such primary key method: id")

    const ransack = {}

    ransack["workplace_id_eq"] = this.id()

    return new Collection(
      {
        reflectionName: "workplace_links",
        model: this,
        modelName: "WorkplaceLink",
        modelClass: WorkplaceLink
      },
      {ransack}
    )
  }

  /** @returns {Promise<Array<WorkplaceLink>>} */
  loadWorkplaceLinks() {
    const ransack = {}

    ransack["workplace_id_eq"] = this.primaryKey()

    return this._loadHasManyReflection(
      {
        reflectionName: "workplace_links",
        model: this,
        modelClass: WorkplaceLink
      },
      {ransack}
    )
  }
}

export default Workplace
