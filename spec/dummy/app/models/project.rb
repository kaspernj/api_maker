class Project < ApplicationRecord
  has_many :project_secrets, dependent: :destroy
  has_many :tasks, dependent: :destroy

  has_one :task

  validates :name, presence: true
end
