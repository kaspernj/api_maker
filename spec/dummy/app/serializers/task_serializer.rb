class TaskSerializer < ApplicationSerializer
  attributes :created_at, :id, :name, :project_id, :user_id

  belongs_to(:project) { include_data :if_sideloaded }
  belongs_to(:user) { include_data :if_sideloaded }
end
