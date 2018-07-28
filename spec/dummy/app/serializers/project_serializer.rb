class ProjectSerializer < ApplicationSerializer
  attributes :id, :name, :created_at
  has_many :tasks
end
