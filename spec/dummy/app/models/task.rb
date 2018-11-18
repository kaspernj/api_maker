class Task < ApplicationRecord
  belongs_to :project
  belongs_to :user, optional: true

  has_one :account, through: :project
  has_one :customer, through: :project

  validates :name, presence: true
end
