class Customer < ApplicationRecord
  has_many :accounts, dependent: :destroy, inverse_of: :customer
end
