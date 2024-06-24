class ApiMaker::ModelsGeneratorService < ApiMaker::ApplicationService
  def perform
    ApiMaker::GenerateReactNativeApiService.execute! if ApiMaker::Configuration.current.react_native_path.present?
    succeed!
  end

  def ignore_model?(model)
    model.name.end_with?("::Translation", "::ApplicationRecord")
  end

private

  def copy_base_files(files, path, target_path)
    files.each do |file|
      base_model_source_path = File.join(path, file)
      base_model_target_path = File.join(target_path, file)

      base_model_target_dir = File.dirname(base_model_target_path)
      FileUtils.mkdir_p(base_model_target_dir)

      if File.exist?(base_model_source_path)
        content = File.read(base_model_source_path)
      else
        base_model_source_path << ".erb"
        erb = ERB.new(File.read(base_model_source_path))
        erb.filename = base_model_source_path
        content = erb.result(binding)
      end

      base_model_target_path = File.join(target_path, file)

      File.write(base_model_target_path, content)
    end
  end
end
