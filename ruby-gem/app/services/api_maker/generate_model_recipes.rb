class ApiMaker::GenerateModelRecipes < ApiMaker::ApplicationService
  def perform
    ApiMaker::GenerateFrontendModels.execute!

    file_path = Rails.root.join("app/javascript/model-recipes.json")
    content = ApiMaker::ModelClassesJavaScriptGeneratorService.execute!
    File.write(file_path, JSON.pretty_generate(content))

    translated_collections_data_path = Rails.root.join("app/javascript/translated-collections-data.json")
    File.write(translated_collections_data_path, JSON.pretty_generate(ApiMaker::TranslatedCollections.translated_collections))

    succeed!
  end
end
