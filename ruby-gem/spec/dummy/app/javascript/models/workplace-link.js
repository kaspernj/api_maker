import BaseModel from "../base-model.js"

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
    "resource_id": {
      "column": {
        "default": null,
        "name": "resource_id",
        "null": false,
        "type": "integer"
      },
      "name": "resource_id",
      "selected_by_default": null,
      "translated": null
    },
    "resource_type": {
      "column": {
        "default": null,
        "name": "resource_type",
        "null": false,
        "type": "string"
      },
      "name": "resource_type",
      "selected_by_default": null,
      "translated": null
    }
  },
  "className": "WorkerPlugins::WorkplaceLink",
  "collectionKey": "worker_plugins/workplace_links",
  "collectionName": "workplace_links",
  "i18nKey": "worker_plugins/workplace_link",
  "camelizedLower": "workerPlugins::WorkplaceLink",
  "name": "WorkplaceLink",
  "nameDasherized": "workplace-link",
  "pluralName": "worker_plugins_workplace_links",
  "ransackable_associations": [
    {
      "className": "Resource",
      "collectionName": null,
      "foreignKey": "resource_id",
      "name": "resource",
      "macro": "belongs_to",
      "resource_name": null,
      "through": null
    },
    {
      "className": "Workplace",
      "collectionName": "workplaces",
      "foreignKey": "workplace_id",
      "name": "workplace",
      "macro": "belongs_to",
      "resource_name": "Workplace",
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
      "name": "custom_data",
      "column": {
        "default": null,
        "name": "custom_data",
        "null": true,
        "type": "json"
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
    },
    {
      "name": "workplace_id",
      "column": {
        "default": null,
        "name": "workplace_id",
        "null": false,
        "type": "integer"
      }
    }
  ],
  "ransackable_scopes": [

  ],
  "relationships": [

  ],
  "paramKey": "workplace_link",
  "primaryKey": "id"
}

/** Frontend model for WorkplaceLink. */
class WorkplaceLink extends BaseModel {
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

  /** @returns {number} */
  resourceId() {
    return this.readAttributeUnderscore("resource_id")
  }

  /** @returns {boolean} */
  hasResourceId() {
    const value = this.resourceId()

    return this._isPresent(value)
  }

  /** @returns {string} */
  resourceType() {
    return this.readAttributeUnderscore("resource_type")
  }

  /** @returns {boolean} */
  hasResourceType() {
    const value = this.resourceType()

    return this._isPresent(value)
  }
}

export default WorkplaceLink
