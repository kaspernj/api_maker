class Task < ApplicationRecord
  belongs_to :project, inverse_of: :tasks
  belongs_to :user, inverse_of: :tasks, optional: true

  has_one :account, through: :project
  has_one :customer, through: :project
  has_one :project_detail, through: :project

  validates :name, presence: true
end
