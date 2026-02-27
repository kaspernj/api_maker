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
    }
  },
  "className": "Customer",
  "collectionKey": "customers",
  "collectionName": "customers",
  "i18nKey": "customer",
  "camelizedLower": "customer",
  "name": "Customer",
  "nameDasherized": "customer",
  "pluralName": "customers",
  "ransackable_associations": [
    {
      "className": "Account",
      "collectionName": "accounts",
      "foreignKey": "customer_id",
      "name": "accounts",
      "macro": "has_many",
      "resource_name": "Account",
      "through": null
    },
    {
      "className": "Customer",
      "collectionName": "customers",
      "foreignKey": "child_id",
      "name": "children",
      "macro": "has_many",
      "resource_name": "Customer",
      "through": "children_relationships"
    },
    {
      "className": "CustomerRelationship",
      "collectionName": null,
      "foreignKey": "parent_id",
      "name": "children_relationships",
      "macro": "has_many",
      "resource_name": null,
      "through": null
    },
    {
      "className": "Customer",
      "collectionName": "customers",
      "foreignKey": "parent_id",
      "name": "commune",
      "macro": "has_one",
      "resource_name": "Customer",
      "through": "commune_relationship"
    },
    {
      "className": "Customer",
      "collectionName": "customers",
      "foreignKey": "child_id",
      "name": "commune_for",
      "macro": "has_many",
      "resource_name": "Customer",
      "through": "commune_for_relationships"
    },
    {
      "className": "CustomerRelationship",
      "collectionName": null,
      "foreignKey": "parent_id",
      "name": "commune_for_relationships",
      "macro": "has_many",
      "resource_name": null,
      "through": null
    },
    {
      "className": "CustomerRelationship",
      "collectionName": null,
      "foreignKey": "child_id",
      "name": "commune_relationship",
      "macro": "has_one",
      "resource_name": null,
      "through": null
    },
    {
      "className": "CustomerRelationship",
      "collectionName": null,
      "foreignKey": "child_id",
      "name": "parent_relationships",
      "macro": "has_many",
      "resource_name": null,
      "through": null
    },
    {
      "className": "Customer",
      "collectionName": "customers",
      "foreignKey": "parent_id",
      "name": "parents",
      "macro": "has_many",
      "resource_name": "Customer",
      "through": "parent_relationships"
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
      "className": "Project",
      "collectionName": "projects",
      "foreignKey": "account_id",
      "name": "projects",
      "macro": "has_many",
      "resource_name": "Project",
      "through": "accounts"
    },
    {
      "className": "Task",
      "collectionName": "tasks",
      "foreignKey": "project_id",
      "name": "tasks",
      "macro": "has_many",
      "resource_name": "Task",
      "through": "projects"
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

  ],
  "paramKey": "customer",
  "primaryKey": "id"
}

/** Frontend model for Customer. */
class Customer extends BaseModel {
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
}

export default Customer
