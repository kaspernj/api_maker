class PolymorphicModel < ApplicationRecord
    belongs_to :resource, polymorphic: true
end
