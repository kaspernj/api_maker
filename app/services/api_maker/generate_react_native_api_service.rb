class ApiMaker::GenerateReactNativeApiService < ApiMaker::ApplicationService
  def execute!
    check_if_root_folder_defined
    create_root_folder
  end

  def root_folder
    @root_folder ||= ApiMaker::Configuration.current.react_native_path
  end

  def check_if_root_folder_defined
    raise "No root folder detected" if root_folder.blank?
  end

  def create_root_folder
    Dir.mkdir(root_folder) unless Dir.exists?(root_folder)
  end
end
