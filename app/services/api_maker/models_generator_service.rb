class ApiMaker::ModelsGeneratorService < ApiMaker::ApplicationService
  def execute
    create_base_structure
    copy_base_model
    copy_base_controllers

    models.each do |model|
      next if ignore_model?(model)

      model_content_response = ApiMaker::ModelContentGeneratorService.execute(model: model)

      if model_content_response.success?
        File.open(model_file(model), "w") { |fp| fp.write(model_content_response.result) }
      else
        puts model_content_response.errors.join(". ")
      end
    end

    ApiMaker::GenerateReactNativeApiService.execute! if ApiMaker::Configuration.current.react_native_path.present?
    ServicePattern::Response.new(success: true)
  end

  def ignore_model?(model)
    model.name.end_with?("::Translation") ||
      model.name.start_with?("ActiveStorage::") ||
      model.name.end_with?("::ApplicationRecord")
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

  def copy_base_controllers
    files = %w[devise_controller.rb]
    path = File.join(__dir__, "..", "..", "controllers", "api_maker")
    target_path = Rails.root.join("app/controllers/api_maker")

    copy_base_files(files, path, target_path)
  end

  def copy_base_model
    files = %w[
      api.js base-model.js cable-connection-pool.js cable-subscription.js cable-subscription-pool.js collection.js
      commands-pool.js event-created.jsx custom-error.js deserializer.js devise.js event-destroyed.jsx event-emitter-listener.jsx event-listener.jsx
      event-updated.jsx error-logger.js form-data-to-object.js included.js key-value-store.js logger.js model-name.js models-response-reader.js
      params.js result.js event-connection.jsx paginate.jsx sort-link.jsx updated-attribute.jsx resource-routes.jsx resource-route.jsx
      session-status-updater.js validation-errors.js bootstrap/attribute-row.jsx bootstrap/attribute-rows.jsx bootstrap/card.jsx
      bootstrap/checkbox.jsx bootstrap/checkboxes.jsx bootstrap/invalid-feedback.jsx bootstrap/money-input.jsx bootstrap/radio-buttons.jsx
      bootstrap/select.jsx bootstrap/string-input.jsx bootstrap/live-table.jsx
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

    FileUtils.mkdir_p(api_maker_root_path.join("models"))
    FileUtils.mkdir_p(controller_path) unless File.exist?(controller_path)
  end

  def model_file(model)
    resource_class = ApiMaker::MemoryStorage.current.resource_for_model(model)
    api_maker_root_path.join("models", "#{resource_class.short_name.underscore.dasherize}.js")
  end
end
