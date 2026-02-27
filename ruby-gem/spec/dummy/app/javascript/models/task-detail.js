import BaseModel from "../base-model.js"

const modelClassData = {
  "attributes": {
  },
  "className": "TaskDetail",
  "collectionKey": "task_details",
  "collectionName": "task_details",
  "i18nKey": "task_detail",
  "camelizedLower": "taskDetail",
  "name": "TaskDetail",
  "nameDasherized": "task-detail",
  "pluralName": "task_details",
  "ransackable_associations": [
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

  ],
  "paramKey": "task_detail",
  "primaryKey": "id"
}

/** Frontend model for TaskDetail. */
class TaskDetail extends BaseModel {
  /** @returns {Record<string, any>} */
  static modelClassData() {
    return modelClassData
  }
}

export default TaskDetail
