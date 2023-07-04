class Account < ApplicationRecord
  belongs_to :customer, optional: true, inverse_of: :accounts

  has_many :account_marked_tasks, dependent: :destroy
  has_many :tasks, through: :account_marked_tasks, inverse_of: :accounts
  has_many :projects, dependent: :destroy, inverse_of: :account
  has_many :project_details, through: :projects, inverse_of: :accounts
  has_many :project_tasks, source: :tasks, through: :projects
  has_many :users, through: :tasks

  has_one :commune, through: :customer

  accepts_nested_attributes_for :projects
end
