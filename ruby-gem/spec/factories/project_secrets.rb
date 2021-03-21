FactoryBot.define do
  factory :project_secret do
    sequence(:key) { |n| "key-#{n}" }
    project
    sequence(:secret) { |n| "secret-#{n}" }
  end
end
