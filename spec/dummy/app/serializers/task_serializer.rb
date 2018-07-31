class TaskSerializer < ApplicationSerializer
  attributes :id, :name, :project_id, :created_at
  belongs_to(:project) { include_data :if_sideloaded }
end
