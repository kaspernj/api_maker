class ApiMaker::ModelClassesJavaScriptGeneratorService < ApiMaker::ApplicationService
  def execute
    javascript_code = ""
    resource_names = []

    models.each do |model|
      next if ignore_model?(model)

      javascript_code << ApiMaker::ModelContentGeneratorService.execute!(export_default: false, model: model, import_classes: false)
      javascript_code << "\n\n"

      resource = resource_for_model(model)
      resource_names << resource.short_name
    end

    javascript_code << "export {#{resource_names.sort.join(", ")}}\n"

    Rails.logger.info "GENERATED JAVASCRIPT CODE:\n\n#{javascript_code}\n\n"

    succeed! javascript_code
  end

  def ignore_model?(model)
    model.name.end_with?("::Translation", "::ApplicationRecord")
  end

  def models
    @models ||= ApiMaker::ModelsFinderService.execute!
  end

  def model_file(model)
    resource_class = ApiMaker::MemoryStorage.current.resource_for_model(model)
    api_maker_root_path.join("models", "#{resource_class.short_name.underscore.dasherize}.js")
  end

  def resource_for_model(model)
    ApiMaker::MemoryStorage.current.resource_for_model(model)
  end
end
