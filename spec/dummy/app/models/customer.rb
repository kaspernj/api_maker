class Customer < ApplicationRecord
  has_many :accounts, dependent: :destroy, inverse_of: :customer
  has_many :projects, through: :accounts
  has_many :project_details, through: :projects, inverse_of: :customers
  has_many :tasks, through: :projects

  has_many :parent_relationships,
    class_name: "CustomerRelationship",
    dependent: :destroy,
    foreign_key: :child_id,
    inverse_of: :child

  has_many :children_relationships,
    class_name: "CustomerRelationship",
    dependent: :destroy,
    foreign_key: :parent_id,
    inverse_of: :parent

  has_many :children, source: :child, through: :children_relationships
  has_many :parents, source: :parent, through: :parent_relationships

  has_many :commune_for_relationships,
    -> { where(relationship_type: "commune") },
    class_name: "CustomerRelationship",
    dependent: :destroy,
    foreign_key: :parent_id,
    inverse_of: :parent
  has_many :commune_for, inverse_of: :commune, source: :child, through: :commune_for_relationships

  has_one :commune_relationship,
    -> { where(relationship_type: "commune") },
    class_name: "CustomerRelationship",
    dependent: :destroy,
    foreign_key: :child_id,
    inverse_of: :child
  has_one :commune, inverse_of: :commune_for, source: :parent, through: :commune_relationship
end
