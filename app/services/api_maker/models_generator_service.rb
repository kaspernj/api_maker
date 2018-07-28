class ApiMaker::ModelsGeneratorService < ApiMaker::ApplicationService
  def execute!
    create_base_structure
    copy_base_model

    models.each do |model|
      next if ignore_model?(model)

      controller_file = controller_path.join("#{model.name.underscore.pluralize}_controller.rb")
      model_file = api_maker_root_path.join("models", "#{model.name}.js")

      File.open(model_file, "w") { |fp| fp.write(model_content(model)) }
      File.open(controller_file, "w") { |fp| fp.write(controller_content(model)) } # unless File.exist?(controller_file)
    end
  end

private

  def api_maker_root_path
    Rails.root.join("app", "javascript", "ApiMaker")
  end

  def controller_content(model)
    ApiMaker::ControllerContentGeneratorService.execute!(model: model).result
  end

  def controller_path
    Rails.root.join("app", "controllers", "api_maker")
  end

  def copy_base_model
    files = %w[BaseModel Collection]
    files.each do |file|
      base_model_source_path = File.join(__dir__, "..", "..", "..", "lib", "api_maker", "javascript", "#{file}.js")
      base_model_target_path = api_maker_root_path.join("models", "#{file}.js")
      FileUtils.copy(base_model_source_path, base_model_target_path)
    end
  end

  def create_base_structure
    FileUtils.rm_rf(api_maker_root_path) if File.exist?(api_maker_root_path)
    FileUtils.mkdir_p(api_maker_root_path.join("models"))
    FileUtils.mkdir_p(controller_path) unless File.exist?(controller_path)
  end

  def ignore_model?(model)
    model.name.end_with?("::Translation") ||
      model.name.start_with?("ActiveStorage::") ||
      model.name.end_with?("::ApplicationRecord")
  end

  def model_content(model)
    ApiMaker::ModelContentGeneratorService.execute!(model: model).result
  end

  def models
    ApiMaker::ModelsFinderService.execute!.result
  end
end
