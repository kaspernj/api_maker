class ApiMaker::SelectColumnsOnCollection < ApiMaker::ApplicationService
  def initialize(collection:, model_class: nil, select_columns:, table_name: nil)
    @collection = collection
    @model_class = model_class || collection.model
    @select_columns = select_columns
    @table_name = table_name || @model_class.table_name
  end

  def execute
    new_collection = @collection
    param_name = @model_class.model_name.param_key.dasherize
    selected_columns = @select_columns&.dig(param_name)

    if selected_columns
      selected_columns.each do |column_name|
        new_collection = new_collection.select("#{@table_name}.#{column_name}")
      end
    else
      new_collection = new_collection.select("#{@table_name}.*")
    end

    succeed! new_collection
  end
end
