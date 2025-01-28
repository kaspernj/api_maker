class ApiMaker::GenerateModelRecipes < ApiMaker::ApplicationService
  def perform
    file_path = Rails.root.join("app/javascript/model-recipes.json")
    content = ApiMaker::ModelClassesJavaScriptGeneratorService.execute!
    File.write(file_path, JSON.pretty_generate(content))

    translated_collections_data_path = Rails.root.join("app/javascript/translated-collections-data.json")
    File.write(translated_collections_data_path, JSON.pretty_generate(ApiMaker::TranslatedCollections.translated_collections))

    models_file_path = Rails.root.join("app/javascript/models.js")
    File.write(models_file_path, models_content)

    succeed!
  end

  def models_content
    models_file_path = "#{__dir__}/../../../../npm-api-maker/src/models.js.erb"

    erb = ERB.new(File.read(models_file_path))
    erb.filename = models_file_path
    erb.result(binding)
  end
end
