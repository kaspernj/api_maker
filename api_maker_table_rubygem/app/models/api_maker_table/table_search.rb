class ApiMakerTable::TableSearch < ApiMakerTable::ApplicationRecord
  self.table_name = "table_searches"

  USER_TYPE_COLUMN = ApiMakerTable::TableSearch.column_names.include?("user_type") rescue true

  belongs_to :user, optional: true, polymorphic: USER_TYPE_COLUMN

  validates :name, :query_params, presence: true

  serialize :query_params, coder: JSON

  def self.user_type_column?
    @user_type_column ||= {result: (ApiMakerTable::TableSearch.column_names.include?("user_type") rescue true)}
    @user_type_column.fetch(:result)
  end

  def query_params=(new_query_params)
    new_query_params = JSON.parse(new_query_params) if new_query_params.is_a?(String)

    super(new_query_params)
  end
end
