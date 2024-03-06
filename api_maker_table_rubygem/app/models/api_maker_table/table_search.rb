class ApiMakerTable::TableSearch < ApiMakerTable::ApplicationRecord
  self.table_name = "table_searches"

  belongs_to :user, optional: true, polymorphic: true

  validates :name, :query_params, presence: true

  serialize :query_params, coder: JSON

  def query_params=(new_query_params)
    new_query_params = JSON.parse(new_query_params) if new_query_params.is_a?(String)

    super(new_query_params)
  end
end
