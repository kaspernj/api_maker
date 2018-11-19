class Project < ApplicationRecord
  belongs_to :account, inverse_of: :projects, optional: true

  has_many :project_secrets, dependent: :destroy
  has_many :tasks, dependent: :destroy, inverse_of: :project

  has_one :customer, through: :account
  has_one :project_detail, dependent: :destroy

  validates :name, presence: true
end
