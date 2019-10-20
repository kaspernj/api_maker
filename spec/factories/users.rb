FactoryBot.define do
  factory :user do
    birthday_at { "1985-06-17" }
    sequence(:email) { |n| "user#{n}@example.com" }
    password { "password.123" }
    password_confirmation { "password.123" }
  end
end
