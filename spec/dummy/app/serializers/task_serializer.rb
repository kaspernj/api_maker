class TaskSerializer < ApplicationSerializer
  attributes :id, :name, :created_at
  belongs_to :project
end
