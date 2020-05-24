class CustomerRelationship < ApplicationRecord
  belongs_to :child, class_name: "Customer"
  belongs_to :parent, class_name: "Customer"

  validates :relationship_type, presence: true
end
