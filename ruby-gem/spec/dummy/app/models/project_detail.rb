class ProjectDetail < ApplicationRecord
  belongs_to :project

  has_many :accounts, through: :project, inverse_of: :project_details
  has_many :customers, through: :accounts, inverse_of: :project_details
end
