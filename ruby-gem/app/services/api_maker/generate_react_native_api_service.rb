class ApiMaker::GenerateReactNativeApiService < ApiMaker::ApplicationService
  def perform
    check_if_root_folder_defined
    create_root_folder
    create_model_files

    succeed!
  end

  def root_folder
    @root_folder ||= ApiMaker::Configuration.current.react_native_path
  end

  def check_if_root_folder_defined
    raise "No root folder detected" if root_folder.blank?

    FileUtils.mkdir_p(model_path)
  end

  def create_root_folder
    FileUtils.mkdir_p(root_folder)
  end

  def model_generator_service
    @model_generator_service ||= ApiMaker::ModelsGeneratorService.new
  end

  def model_file(model)
    resource_class = ApiMaker::MemoryStorage.current.resource_for_model(model)
    File.join(model_path, "#{resource_class.short_name.underscore.dasherize}.js")
  end

  def model_path
    @model_path ||= File.join(root_folder, "models")
  end

  def copy_base_model
    files = %w[
      devise.js event-connection.jsx
    ]
    path = File.join(__dir__, "..", "..", "..", "lib", "api_maker", "javascript")

    copy_base_files(files, path, root_folder)
  end
end
