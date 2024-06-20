FactoryBot.define do
  factory :table_search, class: "ApiMakerTable::TableSearch" do
    sequence(:name) { |n| "Table search #{n}" }
    query_params { JSON.generate(id_eq: "something") }
    user
  end
end
