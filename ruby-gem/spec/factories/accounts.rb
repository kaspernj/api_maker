FactoryBot.define do
  factory :account do
    sequence(:name) { |n| "Account #{n}" }
  end
end
