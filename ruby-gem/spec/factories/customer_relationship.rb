FactoryBot.define do
  factory :customer_relationship do
    child factory: %i[customer]
    parent factory: %i[customer]
    relationship_type { "commune" }
  end
end
