FactoryBot.define do
  factory :project_detail do
    project
    sequence(:details) { |n| "Project details #{n}" }
  end
end
