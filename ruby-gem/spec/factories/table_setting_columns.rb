FactoryBot.define do
  factory :table_setting_column, class: "ApiMakerTable::TableSettingColumn" do
    sequence(:position) { |n| n }
    table_setting
  end
end
