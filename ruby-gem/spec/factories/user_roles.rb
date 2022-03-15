FactoryBot.define do
  factory :user_role do
    sequence(:role) { |n| "Role #{n}" }
    user
  end
end
