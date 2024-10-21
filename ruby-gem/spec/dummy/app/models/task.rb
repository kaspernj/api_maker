class Task < ApplicationRecord
  api_maker_broadcast_creates
  api_maker_broadcast_destroys
  api_maker_broadcast_updates

  belongs_to :project, inverse_of: :tasks
  belongs_to :user, inverse_of: :tasks, optional: true

  has_many :account_marked_tasks, dependent: :destroy
  has_many :accounts, through: :account_marked_tasks, inverse_of: :tasks
  has_many :comments, as: :resource, dependent: :destroy

  has_one :comment, as: :resource # Used to test has-one-preloader

  has_one :account, through: :project
  has_one :customer, through: :account
  has_one :account_customer, through: :account, source: :customer
  has_one :project_detail, through: :project

  validates :name, presence: true

  accepts_nested_attributes_for :project

  scope :some_name_contains, ->(name) { left_joins(:account, :project).where("accounts.name LIKE :name OR projects.name LIKE :name", name: "%#{name}%") }

  translated_collection :state do
    {
      t(".open") => "open",
      t(".closed") => "closed"
    }
  end

  def self.ransackable_scopes(_auth_object = nil)
    super + [:some_name_contains]
  end
end
