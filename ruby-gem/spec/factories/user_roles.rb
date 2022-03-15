FactoryBot.define do
  factory :user_role, class: User::Role do
    sequence(:role) { |n| "Role #{n}" }
    user
  end
end
