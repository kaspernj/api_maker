class ApiMaker::ModelsGeneratorService < ApiMaker::ApplicationService
  def execute!
    create_base_structure
    copy_base_model
    copy_base_controllers

    models.each do |model|
      next if ignore_model?(model)
      model_content_response = ApiMaker::ModelContentGeneratorService.execute!(model: model)

      if model_content_response.success?
        File.open(model_file(model), "w") { |fp| fp.write(model_content_response.result) }
        File.open(controller_file(model), "w") { |fp| fp.write(controller_content(model)) } unless File.exist?(controller_file(model))
      else
        puts model_content_response.errors.join(". ")
      end
    end
  end

private

  def api_maker_root_path
    Rails.root.join("app", "javascript", "ApiMaker")
  end

  def controller_content(model)
    ApiMaker::ControllerContentGeneratorService.execute!(model: model).result
  end

  def controller_file(model)
    controller_path.join("#{model.name.underscore.pluralize}_controller.rb")
  end

  def controller_path
    Rails.root.join("app", "controllers", "api_maker")
  end

  def copy_base_controllers
    files = %w[devise_controller.rb]
    path = File.join(__dir__, "..", "..", "controllers", "api_maker")
    target_path = Rails.root.join("app", "controllers", "api_maker")

    copy_base_files(files, path, target_path)
  end

  def copy_base_model
    files = %w[
      Api.js BaseModel.js Collection.js Devise.js ModelName.js Paginate.jsx SortLink.jsx Result.js
      Bootstrap/Checkbox.jsx Bootstrap/MoneyInput.jsx Bootstrap/RadioButtons.jsx Bootstrap/Select.jsx Bootstrap/StringInput.jsx
    ]
    path = File.join(__dir__, "..", "..", "..", "lib", "api_maker", "javascript")
    target_path = api_maker_root_path

    copy_base_files(files, path, target_path)
  end

  def copy_base_files(files, path, target_path)
    files.each do |file|
      base_model_source_path = File.join(path, file)
      base_model_target_path = File.join(target_path, file)

      base_model_target_dir = File.dirname(base_model_target_path)
      FileUtils.mkdir_p(base_model_target_dir) unless File.exist?(base_model_target_dir)

      if File.exist?(base_model_source_path)
        content = File.read(base_model_source_path)
      else
        base_model_source_path << ".erb"
        erb = ERB.new(File.read(base_model_source_path))
        content = erb.result(binding)
      end

      base_model_target_path = File.join(target_path, file)

      File.open(base_model_target_path, "w") do |fp|
        fp.write(content)
      end
    end
  end

  def create_base_structure
    # Dont remove all the files. It messes up running Webpack Dev Servers which forces you to restart all the time.
    # FileUtils.rm_rf(api_maker_root_path) if File.exist?(api_maker_root_path)

    FileUtils.mkdir_p(api_maker_root_path.join("Models"))
    FileUtils.mkdir_p(controller_path) unless File.exist?(controller_path)
  end

  def ignore_model?(model)
    model.name.end_with?("::Translation") ||
      model.name.start_with?("ActiveStorage::") ||
      model.name.end_with?("::ApplicationRecord")
  end

  def models
    ApiMaker::ModelsFinderService.execute!.result
  end

  def model_file(model)
    api_maker_root_path.join("Models", "#{model.name}.js")
  end
end
