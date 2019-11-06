require "public_activity"

FactoryBot.define do
  factory :activity, class: PublicActivity::Activity do
    association :trackable, factory: :task
  end
end
