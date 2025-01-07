class ApiMaker::GenerateModelRecipes < ApiMaker::ApplicationService
  def perform
    file_path = Rails.root.join("app/javascript/model-recipes.json")
    content = ApiMaker::ModelClassesJavaScriptGeneratorService.execute!
    File.write(file_path, JSON.pretty_generate(content))
    succeed!
  end
end
