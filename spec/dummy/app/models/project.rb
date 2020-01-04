require "money-rails"
MoneyRails::Hooks.init

class Project < ApplicationRecord
  belongs_to :account, -> { where(deleted_at: nil) }, inverse_of: :projects

  has_many :project_secrets, dependent: :destroy
  has_many :tasks, dependent: :destroy, inverse_of: :project

  has_one :customer, through: :account
  has_one :project_detail, dependent: :destroy

  validates :name, presence: true

  monetize :price_per_hour_cents, allow_nil: true
end
