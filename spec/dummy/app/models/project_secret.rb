class ProjectSecret < ApplicationRecord
  belongs_to :project

  validates :key, :secret, presence: true
end
