// @ts-check

import BaseModel from "@kaspernj/api-maker/build/base-model.js"
import Collection from "@kaspernj/api-maker/build/collection.js"
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

  ],
  "ransackable_attributes": [

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
export default class Workplace extends BaseModel {
  /** @returns {typeof modelClassData} */
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
    return /** @type {Promise<TCommandResponse>} */ (BaseModel._callCollectionCommand(
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
    return /** @type {Promise<TCommandResponse>} */ (BaseModel._callCollectionCommand(
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
    return /** @type {Promise<TCommandResponse>} */ (BaseModel._callCollectionCommand(
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
    return /** @type {Promise<TCommandResponse>} */ (BaseModel._callCollectionCommand(
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
    return /** @type {Promise<TCommandResponse>} */ (BaseModel._callCollectionCommand(
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

  /** @returns {import("@kaspernj/api-maker/build/collection.js").default<typeof import("./workplace-link.js").default>} */
  workplaceLinks() {
    if (!("id" in this)) throw new Error("No such primary key method: id")

    const ransack = {}

    ransack["workplace_id_eq"] = this.id()

    return new Collection(
      {
        reflectionName: "workplace_links",
        model: this,
        modelClass: WorkplaceLink
      },
      {ransack}
    )
  }

  /** @returns {Promise<Array<import("./workplace-link.js").default>>} */
  loadWorkplaceLinks() {
    if (!("id" in this)) throw new Error("No such primary key method: id")

    const ransack = {}

    ransack["workplace_id_eq"] = this.id()

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
