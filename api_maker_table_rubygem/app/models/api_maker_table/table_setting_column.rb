class ApiMakerTable::TableSettingColumn < ApiMakerTable::ApplicationRecord
  self.table_name = "table_setting_columns"

  acts_as_list scope: :table_setting_id

  belongs_to :table_setting

  validates :identifier, presence: true, uniqueness: {scope: :table_setting}
end
