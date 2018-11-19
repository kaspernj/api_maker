class Account < ApplicationRecord
  belongs_to :customer, optional: true, inverse_of: :accounts

  has_many :projects, dependent: :destroy, inverse_of: :account
end
