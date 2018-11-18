class Account < ApplicationRecord
  belongs_to :customer, optional: true

  has_many :projects, dependent: :destroy
end
