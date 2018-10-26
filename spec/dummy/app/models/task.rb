class Task < ApplicationRecord
  belongs_to :project
  belongs_to :user, optional: true

  validates :name, presence: true
end
