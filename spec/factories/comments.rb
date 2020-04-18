FactoryBot.define do
  factory :comment do
    association :author, factory: :user
    association :resource, factory: :task
    comment { "Comment" }
  end
end
