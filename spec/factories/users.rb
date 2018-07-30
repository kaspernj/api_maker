FactoryBot.define do
  factory :user do
    sequence(:email) { |n| "user#{n}@example.com" }
    password "password.123"
    password_confirmation "password.123"
  end
end
