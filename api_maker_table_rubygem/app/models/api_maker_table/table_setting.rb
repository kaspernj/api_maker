class ApiMakerTable::TableSetting < ApiMakerTable::ApplicationRecord
  has_many :columns, class_name: "ApiMakerTable::TableSettingColumn"
end
