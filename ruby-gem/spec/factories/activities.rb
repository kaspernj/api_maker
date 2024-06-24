require "public_activity"

FactoryBot.define do
  factory :activity, class: "PublicActivity::Activity" do
    trackable factory: %i[task]
  end
end
