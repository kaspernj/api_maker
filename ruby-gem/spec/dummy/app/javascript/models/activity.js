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
    }
  },
  "className": "PublicActivity::Activity",
  "collectionKey": "public_activity/activities",
  "collectionName": "activities",
  "i18nKey": "public_activity/activity",
  "camelizedLower": "publicActivity::Activity",
  "name": "Activity",
  "nameDasherized": "activity",
  "pluralName": "public_activity_activities",
  "ransackable_associations": [
    {
      "className": "Owner",
      "collectionName": null,
      "foreignKey": "owner_id",
      "name": "owner",
      "macro": "belongs_to",
      "resource_name": null,
      "through": null
    },
    {
      "className": "Recipient",
      "collectionName": null,
      "foreignKey": "recipient_id",
      "name": "recipient",
      "macro": "belongs_to",
      "resource_name": null,
      "through": null
    },
    {
      "className": "Trackable",
      "collectionName": null,
      "foreignKey": "trackable_id",
      "name": "trackable",
      "macro": "belongs_to",
      "resource_name": null,
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
      "name": "key",
      "column": {
        "default": null,
        "name": "key",
        "null": true,
        "type": "string"
      }
    },
    {
      "name": "owner_id",
      "column": {
        "default": null,
        "name": "owner_id",
        "null": true,
        "type": "integer"
      }
    },
    {
      "name": "owner_type",
      "column": {
        "default": null,
        "name": "owner_type",
        "null": true,
        "type": "string"
      }
    },
    {
      "name": "parameters",
      "column": {
        "default": null,
        "name": "parameters",
        "null": true,
        "type": "text"
      }
    },
    {
      "name": "recipient_id",
      "column": {
        "default": null,
        "name": "recipient_id",
        "null": true,
        "type": "integer"
      }
    },
    {
      "name": "recipient_type",
      "column": {
        "default": null,
        "name": "recipient_type",
        "null": true,
        "type": "string"
      }
    },
    {
      "name": "trackable_id",
      "column": {
        "default": null,
        "name": "trackable_id",
        "null": true,
        "type": "integer"
      }
    },
    {
      "name": "trackable_type",
      "column": {
        "default": null,
        "name": "trackable_type",
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

  ],
  "paramKey": "public_activity_activity",
  "primaryKey": "id"
}

/** Frontend model for Activity. */
class Activity extends BaseModel {
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
}

export default Activity
