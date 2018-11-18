class Customer < ApplicationRecord
  has_many :accounts, dependent: :destroy
end
