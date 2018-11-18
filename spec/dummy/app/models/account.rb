class Account < ApplicationRecord
  has_many :projects, dependent: :destroy
end
