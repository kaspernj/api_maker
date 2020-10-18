class ApiMaker::SelectColumnsOnCollection < ApiMaker::ApplicationService
  def initialize(collection:, model_class: nil, select_columns:, table_name: nil)
    raise "No collection was given" unless collection

    @collection = collection
    @model_class = model_class || collection.model
    @select_columns = select_columns
    @table_name = table_name || @model_class.table_name
  end

  def execute
    new_collection = @collection
    return succeed! new_collection if new_collection.is_a?(Array)

    param_name = @model_class.model_name.param_key.underscore
    selected_columns = @select_columns&.dig(param_name)
    arel_table = Arel::Table.new(@table_name)

    if selected_columns
      selected_columns.each do |column_name|
        validate_column_name!(column_name)
        new_collection = new_collection.select(arel_table[column_name])
      end
    else
      new_collection = prepend_table_wildcard(new_collection) unless table_wildcard_prepended?(new_collection)
    end

    succeed! new_collection
  end

  # Prepends 'table_name.*' to the query. It needs to be pre-pended in case a `COUNT` or another aggregate function has been added to work with `DISTINCT`.
  def prepend_table_wildcard(query)
    old_select = query.values[:select] || []
    old_select = old_select.keep_if { |select_statement| select_statement != select_table_wildcard_sql }

    query = query.except(:select).select(select_table_wildcard_sql)

    old_select.each do |select_statement|
      query = query.select(select_statement)
    end

    query
  end

  def select_table_wildcard_sql
    @select_table_wildcard_sql ||= "#{@table_name}.*"
  end

  def table_wildcard_prepended?(query)
    query.values[:select]&.first == select_table_wildcard_sql
  end

  # Checks that the given column exists to avoid injections
  def validate_column_name!(column_name)
    raise "Invalid column on #{@model_class.name}: #{column_name}" unless @model_class.columns_hash.key?(column_name)
  end
end
