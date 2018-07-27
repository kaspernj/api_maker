class ApiMaker::ModelsGeneratorService < ApiMaker::ApplicationService
  def execute!
    FileUtils.rm_rf(api_maker_root_path) if File.exist?(api_maker_root_path)
    Dir.mkdir(api_maker_root_path)
    Dir.mkdir(api_maker_root_path.join("models"))

    copy_base_model
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

  def copy_base_model
    base_model_source_path = File.join(__dir__, "..", "..", "..", "lib", "api_maker", "javascript", "BaseModel.js")
    base_model_target_path = api_maker_root_path.join("models", "BaseModel.js")

    FileUtils.copy(base_model_source_path, base_model_target_path)
  end

  def model_content
    erb = ERB.new(File.read(model_template_path))
    erb.result(binding)
  end

  def model_template_path
    File.join(__dir__, "..", "..", "..", "lib", "api_maker", "javascript", "ModelTemplate.js.erb")
  end
end
