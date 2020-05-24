class Comment < ApplicationRecord
  belongs_to :author, class_name: "User"
  belongs_to :resource, polymorphic: true

  validates :comment, presence: true
end
