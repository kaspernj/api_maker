// @ts-check

import BaseModel from "@kaspernj/api-maker/build/base-model.js"

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

  ],
  "ransackable_attributes": [

  ],
  "ransackable_scopes": [

  ],
  "relationships": [

  ],
  "paramKey": "public_activity_activity",
  "primaryKey": "id"
}

/** Frontend model for Activity. */
export default class Activity extends BaseModel {
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
}
