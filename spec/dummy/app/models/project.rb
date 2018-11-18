class Project < ApplicationRecord
  belongs_to :account

  has_many :project_secrets, dependent: :destroy
  has_many :tasks, dependent: :destroy

  has_one :customer, through: :account
  has_one :task

  validates :name, presence: true
end
