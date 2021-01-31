class ApiMaker::ModelsGeneratorService < ApiMaker::ApplicationService
  def execute
    create_base_structure
    copy_base_model

    ApiMaker::GenerateReactNativeApiService.execute! if ApiMaker::Configuration.current.react_native_path.present?
    succeed!
  end

  def ignore_model?(model)
    model.name.end_with?("::Translation", "::ApplicationRecord")
  end

  def models
    ApiMaker::ModelsFinderService.execute!
  end

private

  def api_maker_root_path
    Rails.root.join("app/javascript/api-maker")
  end

  def controller_path
    Rails.root.join("app/controllers/api_maker")
  end

  def copy_base_model
    files = %w[models.js.erb]
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
        erb.filename = base_model_source_path
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

    FileUtils.mkdir_p(controller_path) unless File.exist?(controller_path)
  end
end
