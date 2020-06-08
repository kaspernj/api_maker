class ProjectDetail < ApplicationRecord
  belongs_to :project

  has_many :project_detail_files, dependent: :destroy

  has_many :accounts, through: :project, inverse_of: :project_details
  has_many :customers, through: :accounts, inverse_of: :project_details

  accepts_nested_attributes_for :project_detail_files
end
