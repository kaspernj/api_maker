FactoryBot.define do
  factory :project do
    sequence(:name) { |n| "Project #{n}" }
    price_per_hour { Money.new(10_000, "USD") }
  end
end
