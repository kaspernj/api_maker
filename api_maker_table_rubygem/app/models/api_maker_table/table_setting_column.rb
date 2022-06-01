class ApiMakerTable::TableSettingColumn < ApiMakerTable::ApplicationRecord
  self.table_name = "table_setting_columns"

  belongs_to :table_setting

  validates :identifier, presence: true, uniqueness: {scope: :table_setting}
end
