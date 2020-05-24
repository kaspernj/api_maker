FactoryBot.define do
  factory :customer_relationship do
    association :child, factory: :customer
    association :parent, factory: :customer
    relationship_type { "commune" }
  end
end
