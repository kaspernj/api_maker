class ProjectDetailFile < ApplicationRecord
  belongs_to :project_detail

  validates :filename, presence: true
end
