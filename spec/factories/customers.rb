FactoryBot.define do
  factory :customer do
    sequence(:name) { |n| "Customer #{n}" }
  end
end
