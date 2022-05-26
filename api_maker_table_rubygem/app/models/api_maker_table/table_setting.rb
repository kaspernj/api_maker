class ApiMakerTable::TableSetting < ApiMakerTable::ApplicationRecord
  self.table_name = "table_settings"

  has_many :columns, class_name: "ApiMakerTable::TableSettingColumn"
end
