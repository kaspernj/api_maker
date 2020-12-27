class ApiMaker::BaseCommand
  ApiMaker::IncludeHelpers.execute!(klass: self)

  attr_reader :api_maker_args, :collection, :collection_instance, :command, :commands, :command_response, :controller, :current_ability

  delegate :args, :model, :model_id, to: :command
  delegate :result_for_command, to: :command_response

  # Returns true if the gem "goldiloader" is present in the app
  def self.goldiloader?
    @goldiloader = Gem::Specification.find_all_by_name("goldiloader").any? if @goldiloader.nil?
    @goldiloader
  end

  def initialize(ability:, args:, collection:, collection_instance:, command:, commands:, command_response:, controller:)
    @api_maker_args = args
    @current_ability = ability
    @collection = collection
    @collection_instance = collection_instance
    @command = command
    @commands = commands
    @command_response = command_response
    @controller = controller
  end

  def self.command_error_message(error)
    if Rails.application.config.consider_all_requests_local
      "#{error.class.name}: #{error.message}"
    else
      "Internal server error"
    end
  end

  def self.execute_in_thread!(ability:, args:, collection:, commands:, command_response:, controller:)
    command_response.with_thread do
      if const_defined?(:CollectionInstance)
        collection_instance = const_get(:CollectionInstance).new(
          ability: ability,
          args: args,
          collection: collection,
          commands: commands,
          command_response: command_response,
          controller: controller
        )

        collection = collection_instance.custom_collection if collection_instance.respond_to?(:custom_collection)
        collection_instance.collection = collection

        threadded = collection_instance.try(:threadded?)
      end

      if threadded
        # Goldiloader doesn't work with threads (loads all relationships for each thread)
        collection = collection.auto_include(false) if ApiMaker::BaseCommand.goldiloader?

        # Load relationship before commands so each command doesn't query on its own
        collection.load
      end

      each_command(collection: collection, command_response: command_response, commands: commands, controller: controller, threadded: threadded) do |command|
        command_instance = new(
          ability: ability,
          args: args,
          collection: collection,
          collection_instance: collection_instance,
          command: command,
          commands: command,
          command_response: command_response,
          controller: controller
        )
        command_instance.execute!
      end
    end
  end

  def self.each_command(collection:, command_response:, commands:, controller:, threadded:, &blk)
    commands.each do |command_id, command_data|
      if threadded
        command_response.with_thread do
          run_command(
            command_id: command_id,
            command_data: command_data,
            command_response: command_response,
            collection: collection,
            controller: controller,
            &blk
          )
        end
      else
        run_command(
          command_id: command_id,
          command_data: command_data,
          command_response: command_response,
          collection: collection,
          controller: controller,
          &blk
        )
      end
    end
  end

  def self.run_command(collection:, command_id:, command_data:, command_response:, controller:)
    command = ApiMaker::IndividualCommand.new(
      args: ApiMaker::Deserializer.execute!(arg: command_data[:args]),
      collection: collection,
      command: self,
      id: command_id,
      primary_key: command_data[:primary_key],
      response: command_response
    )

    begin
      yield command
    rescue => e # rubocop:disable Style/RescueStandardError
      error_response = {
        success: false,
        errors: [{message: command_error_message(e), type: :runtime_error}]
      }

      Rails.logger.error e.message
      Rails.logger.error e.backtrace.join("\n")

      ApiMaker::Configuration.current.report_error(
        command: command,
        controller: controller,
        error: e,
        response: error_response
      )

      command.error(error_response)
    end
  end

  def execute_service_or_fail(service_class, *args, &blk)
    response = service_class.execute(*args, &blk)

    if response.success?
      succeed!(success: true)
    else
      fail_command_from_service_error_response(command, response)
    end
  end

  def fail_command_from_service_error_response(response)
    fail!(errors: serialize_service_errors(response.errors))
  end

  def failure_response(errors:)
    fail!(
      model: serialized_model(model),
      success: false,
      errors: errors
    )
  end

  def failure_save_response(model:, params:)
    fail!(
      model: serialized_model(model),
      success: false,
      errors: model.errors.full_messages.map { |error_message| {message: error_message, type: :validation_error} },
      validation_errors: ApiMaker::ValidationErrorsGeneratorService.execute!(model: model, params: params)
    )
  end

  def save_models_or_fail(*models, simple_model_errors: false)
    response = Models::Save.execute(models: models, simple_model_errors: simple_model_errors)

    if response.success?
      succeed!(success: true)
      true
    else
      fail!(errors: response.error_messages.map { |error| {message: error, type: :validation_error} })
      false
    end
  end

  def serialize_service_errors(errors)
    errors.map do |error|
      {
        message: error.message,
        type: error.type
      }
    end
  end

  def fail!(*args, &blk)
    command.fail(*args, &blk)
  end

  def succeed!(*args, &blk)
    command.result(*args, &blk)
  end

private

  def serialized_model(model)
    collection_serializer = ApiMaker::CollectionSerializer.new(
      ability: current_ability,
      args: api_maker_args,
      collection: [model],
      model_class: model.class,
      query_params: args&.dig(:query_params)
    )
    collection_serializer.result
  end

  def serialized_resource(model)
    ApiMaker::Serializer.new(ability: current_ability, args: api_maker_args, model: model)
  end
end
