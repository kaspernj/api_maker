class ApiMakerTable::TableSearch < ApiMakerTable::ApplicationRecord
  self.table_name = "table_searches"

  belongs_to :user, optional: true, polymorphic: true
end
