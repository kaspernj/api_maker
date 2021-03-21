class ProjectSecret < ApplicationRecord
  belongs_to :project

  validates :key, :secret, presence: true

  before_destroy :before_destroy_validate_if_allowed

private

  def before_destroy_validate_if_allowed
    if id == 4849
      errors.add(:base, "cannot destroy project secret 4849")
      throw :abort
    end
  end
end
