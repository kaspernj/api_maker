class Customer < ApplicationRecord
  has_many :accounts, dependent: :destroy, inverse_of: :customer
  has_many :projects, through: :accounts
  has_many :project_details, through: :projects, inverse_of: :customers
  has_many :tasks, through: :projects
end
