FactoryBot.define do
  factory :table_setting, class: "ApiMakerTable::TableSetting" do
    identifier { "tasks-default" }
    user
  end
end
