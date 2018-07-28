class Project < ApplicationRecord
  has_many :project_secrets, dependent: :destroy
  has_many :tasks, dependent: :destroy

  validates :name, presence: true
end
