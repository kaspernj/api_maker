require "money-rails"
MoneyRails::Hooks.init

class Project < ApplicationRecord
  belongs_to :account, -> { where(deleted_at: nil) }, inverse_of: :projects

  has_many :project_secrets, dependent: :destroy
  has_many :tasks, dependent: :restrict_with_error, inverse_of: :project

  has_one :customer, through: :account
  has_one :project_detail, -> { where(deleted_at: nil) }, dependent: :destroy

  validates :name, presence: true
  validate :name_cannot_be_hans

  monetize :price_per_hour_cents, allow_nil: true

  accepts_nested_attributes_for :project_detail

private

  def name_cannot_be_hans
    errors.add(:base, "Navn kan ikke være Hans") if name == "Hans"
  end
end
