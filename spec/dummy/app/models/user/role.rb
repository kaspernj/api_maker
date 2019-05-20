class User::Role < ApplicationRecord
  belongs_to :user

  validates :role, presence: true
end
