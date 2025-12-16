/* rails-erb-loader-dependencies api_maker/resources/ models/ */

import {digg} from "diggerize"
import ModelRecipesLoader from "@kaspernj/api-maker/build/model-recipes-loader"
import modelRecipes from "./model-recipes.json"

const loader = new ModelRecipesLoader({recipes: modelRecipes})
const result = loader.load()





  const AccountMarkedTaskModelClass = digg(result, "AccountMarkedTask")

  class AccountMarkedTask extends AccountMarkedTaskModelClass {}



  const AccountModelClass = digg(result, "Account")

  class Account extends AccountModelClass {}



  const ActivityModelClass = digg(result, "Activity")

  class Activity extends ActivityModelClass {}



  const CommentModelClass = digg(result, "Comment")

  class Comment extends CommentModelClass {}



  const CustomerModelClass = digg(result, "Customer")

  class Customer extends CustomerModelClass {}



  const ProjectDetailModelClass = digg(result, "ProjectDetail")

  class ProjectDetail extends ProjectDetailModelClass {}



  const ProjectModelClass = digg(result, "Project")

  class Project extends ProjectModelClass {}



  const TableSearchModelClass = digg(result, "TableSearch")

  class TableSearch extends TableSearchModelClass {}



  const TableSettingColumnModelClass = digg(result, "TableSettingColumn")

  class TableSettingColumn extends TableSettingColumnModelClass {}



  const TableSettingModelClass = digg(result, "TableSetting")

  class TableSetting extends TableSettingModelClass {}



  const TaskDetailModelClass = digg(result, "TaskDetail")

  class TaskDetail extends TaskDetailModelClass {}



  const TaskModelClass = digg(result, "Task")

  class Task extends TaskModelClass {}



  const UserModelClass = digg(result, "User")

  class User extends UserModelClass {}



  const UserRoleModelClass = digg(result, "UserRole")

  class UserRole extends UserRoleModelClass {}



  const WorkplaceLinkModelClass = digg(result, "WorkplaceLink")

  class WorkplaceLink extends WorkplaceLinkModelClass {}



  const WorkplaceModelClass = digg(result, "Workplace")

  class Workplace extends WorkplaceModelClass {}


export {AccountMarkedTask, Account, Activity, Comment, Customer, ProjectDetail, Project, TableSearch, TableSettingColumn, TableSetting, TaskDetail, Task, User, UserRole, WorkplaceLink, Workplace}
