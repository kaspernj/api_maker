class ApiMakerTable::TableSetting < ApiMakerTable::ApplicationRecord
  self.table_name = "table_settings"

  belongs_to :user, optional: true, polymorphic: true

  has_many :columns, class_name: "ApiMakerTable::TableSettingColumn", dependent: :destroy

  accepts_nested_attributes_for :columns, allow_destroy: true
end
