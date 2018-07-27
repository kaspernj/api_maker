class ApiMaker::ModelsGeneratorService < ApiMaker::ApplicationService
  def execute!
    FileUtils.rm_rf(api_maker_root_path) if File.exist?(api_maker_root_path)
    Dir.mkdir(api_maker_root_path)
    Dir.mkdir(api_maker_root_path.join("models"))

    models = ApiMaker::ModelsFinderService.execute!.result

    models.each do |model|
      model_file = api_maker_root_path.join("models", "#{model.name}.js")

      File.open(model_file, "w") do |fp|
        fp.write(model_content)
      end
    end
  end

private

  def api_maker_root_path
    Rails.root.join("app", "javascript", "api_maker")
  end

  def model_content
    "stub!"
  end
end
