import BaseModel from "../base-model.js"
import Project from "./project.js"

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
    "details": {
      "column": {
        "default": null,
        "name": "details",
        "null": true,
        "type": "string"
      },
      "name": "details",
      "selected_by_default": null,
      "translated": null
    }
  },
  "className": "ProjectDetail",
  "collectionKey": "project_details",
  "collectionName": "project_details",
  "i18nKey": "project_detail",
  "camelizedLower": "projectDetail",
  "name": "ProjectDetail",
  "nameDasherized": "project-detail",
  "pluralName": "project_details",
  "ransackable_associations": [
    {
      "className": "Account",
      "collectionName": "accounts",
      "foreignKey": "account_id",
      "name": "accounts",
      "macro": "has_many",
      "resource_name": "Account",
      "through": "project"
    },
    {
      "className": "Customer",
      "collectionName": "customers",
      "foreignKey": "customer_id",
      "name": "customers",
      "macro": "has_many",
      "resource_name": "Customer",
      "through": "accounts"
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
      "className": "ProjectDetailFile",
      "collectionName": null,
      "foreignKey": "project_detail_id",
      "name": "project_detail_files",
      "macro": "has_many",
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
      "name": "deleted_at",
      "column": {
        "default": null,
        "name": "deleted_at",
        "null": true,
        "type": "datetime"
      }
    },
    {
      "name": "details",
      "column": {
        "default": null,
        "name": "details",
        "null": true,
        "type": "string"
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
      "name": "project_id",
      "column": {
        "default": null,
        "name": "project_id",
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
      "className": "Project",
      "collectionName": "projects",
      "foreignKey": "project_id",
      "name": "project",
      "macro": "belongs_to",
      "resource_name": "Project",
      "through": null
    }
  ],
  "paramKey": "project_detail",
  "primaryKey": "id"
}

/** Frontend model for ProjectDetail. */
class ProjectDetail extends BaseModel {
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
  projectId() {
    return this.readAttributeUnderscore("project_id")
  }

  /** @returns {boolean} */
  hasProjectId() {
    const value = this.projectId()

    return this._isPresent(value)
  }

  /** @returns {string | null} */
  details() {
    return this.readAttributeUnderscore("details")
  }

  /** @returns {boolean} */
  hasDetails() {
    const value = this.details()

    return this._isPresent(value)
  }

  /** @returns {Project | null} */
  project() {
    return this._readBelongsToReflection({reflectionName: "project"})
  }

  /** @returns {Promise<Project | null>} */
  loadProject() {
    if (!("projectId" in this)) throw new Error("Foreign key method wasn't defined: projectId")

    const id = this.projectId()
    const ransack = {}

    ransack["id_eq"] = id

    return this._loadBelongsToReflection(
      {reflectionName: "project", model: this, modelClass: Project},
      {ransack}
    )
  }
}

export default ProjectDetail
