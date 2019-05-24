class Task < ApplicationRecord
  api_maker_broadcast_updates

  belongs_to :project, inverse_of: :tasks
  belongs_to :user, inverse_of: :tasks, optional: true

  has_many :account_marked_tasks, dependent: :destroy
  has_many :accounts, through: :account_marked_tasks, inverse_of: :tasks

  has_one :account, through: :project
  has_one :customer, through: :account
  has_one :account_customer, through: :account, source: :customer
  has_one :project_detail, through: :project

  validates :name, presence: true
end
