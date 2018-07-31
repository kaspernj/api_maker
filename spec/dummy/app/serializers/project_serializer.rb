class ProjectSerializer < ApplicationSerializer
  attributes :id, :name, :created_at
  has_many(:tasks) { include_data :if_sideloaded }
  has_one(:task) { include_data :if_sideloaded }
end
