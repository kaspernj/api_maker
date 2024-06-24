class ApiMaker::BaseCommand
  ApiMaker::IncludeHelpers.execute!(klass: self)

  attr_reader :api_maker_args, :collection, :collection_instance, :command, :commands, :command_response, :controller, :current_ability
  attr_accessor :execute_service_or_fail_response

  delegate :args, :model, :model_id, to: :command
  delegate :result_for_command, to: :command_response

  # Returns true if the gem "goldiloader" is present in the app
  def self.goldiloader?
    @goldiloader = Gem::Specification.find_all_by_name("goldiloader").any? if @goldiloader.nil?
    @goldiloader
  end

  def initialize(ability:, api_maker_args:, collection:, collection_instance:, command:, commands:, command_response:, controller:)
    @api_maker_args = api_maker_args
    @current_ability = ability
    @collection = collection
    @collection_instance = collection_instance
    @command = command
    @commands = commands
    @command_response = command_response
    @controller = controller
  end

  def execute_with_response
    execute!
  rescue ApiMaker::CommandFailedError => e
    command.fail(*e.api_maker_args, &e.api_maker_block)
  end

  def self.command_error_message(error)
    if Rails.application.config.consider_all_requests_local
      "#{error.class.name}: #{error.message}"
    else
      "Internal server error"
    end
  end

  def self.execute_in_thread!(ability:, api_maker_args:, collection:, commands:, command_response:, controller:)
    command_response.with_thread do
      if const_defined?(:CollectionInstance)
        collection_instance = const_get(:CollectionInstance).new(
          ability:,
          api_maker_args:,
          collection:,
          commands:,
          command_response:,
          controller:
        )

        collection = collection_instance.custom_collection if collection_instance.respond_to?(:custom_collection)
        collection_instance.collection = collection

        threadded = collection_instance.try(:threadded?)
      end

      if threadded
        Rails.logger.debug { "API maker: Running #{const_get(:CollectionInstance).name}" }

        # Goldiloader doesn't work with threads (loads all relationships for each thread)
        collection = collection.auto_include(false) if ApiMaker::BaseCommand.goldiloader?

        # Load relationship before commands so each command doesn't query on its own
        collection.load
      end

      each_command(collection:, command_response:, commands:, controller:, threadded:) do |command|
        command_instance = new(
          ability:,
          api_maker_args:,
          collection:,
          collection_instance:,
          command:,
          commands: command,
          command_response:,
          controller:
        )
        command_instance.execute_with_response
      end
    end
  end

  def self.each_command(collection:, command_response:, commands:, controller:, threadded:, &blk)
    commands.each do |command_id, command_data|
      if threadded
        Rails.logger.debug { "API maker: Running #{name} threadded" }

        command_response.with_thread do
          run_command(
            command_id:,
            command_data:,
            command_response:,
            collection:,
            controller:,
            &blk
          )
        end
      else
        Rails.logger.debug { "API maker: Running #{name} non-threadded" }

        run_command(
          command_id:,
          command_data:,
          command_response:,
          collection:,
          controller:,
          &blk
        )
      end
    end
  end

  def self.run_command(collection:, command_id:, command_data:, command_response:, controller:)
    command = ApiMaker::IndividualCommand.new(
      args: ApiMaker::Deserializer.execute!(arg: command_data[:args]),
      collection:,
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
      Rails.logger.error Rails.backtrace_cleaner.clean(e.backtrace).join("\n")

      ApiMaker::Configuration.current.report_error(
        command:,
        controller:,
        error: e,
        response: error_response
      )

      command.error(error_response)
    end
  end

  def execute_service_or_fail(service_class, ...)
    self.execute_service_or_fail_response = service_class.execute(...)

    if execute_service_or_fail_response.success?
      succeed!(success: true)
    else
      fail_command_from_service_error_response(execute_service_or_fail_response)
    end
  end

  def execute_service_or_fail_result
    execute_service_or_fail_response.result
  end

  def fail_command_from_service_error_response(response)
    fail!(errors: serialize_service_errors(response.errors))
  end

  def failure_response(errors:)
    fail!(
      model: serialized_model(model),
      success: false,
      errors:
    )
  end

  def failure_save_response(additional_attributes: [], model:, params:, simple_model_errors: false)
    raise "Cannot receive additional attributes unless simple model errors" if !additional_attributes.empty? && !simple_model_errors

    error_messages = if simple_model_errors
      ApiMaker::SimpleModelErrors.execute!(additional_attributes:, model:)
    else
      model.errors.full_messages
    end

    fail!(
      error_type: :validation_error,
      errors: error_messages.map { |error_message| {message: error_message, type: :validation_error} },
      model: serialized_model(model),
      success: false,
      validation_errors: ApiMaker::ValidationErrorsGeneratorService.execute!(model:, params:)
    )
  end

  def model_class
    @model_class ||= collection.klass
  end

  def save_models_or_fail(*models, simple_model_errors: false)
    result = ApiMaker::Models::Save.execute!(models:, simple_model_errors:, succeed_with_errors: true)

    if result.fetch(:failed)
      failed_model_with_params = result.fetch(:failed_models).find { |failed_model| failed_model.is_a?(Hash) && failed_model[:params] }

      if failed_model_with_params
        failure_save_response(**failed_model_with_params)
      else
        fail!(errors: result.fetch(:errors).map { |error| {message: error, type: :validation_error} })
      end
    else
      succeed!(success: true)
      true
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

  def simple_model_errors?
    ActiveModel::Type::Boolean.new.cast(args[:simple_model_errors])
  end

  def fail!(*args, &blk)
    if args.length == 1 && args[0].is_a?(Hash) && args[0].key?(:errors)
      error_messages = args[0].fetch(:errors).map do |error|
        if error.is_a?(Hash) && error.key?(:message)
          error.fetch(:message)
        else
          error
        end
      end

      error_args = args
    elsif args.length == 1 && args[0].is_a?(String)
      error_messages = [args]
      error_args = [{errors: args}]
    else
      error_messages = ["Command failed"]
      error_args = args
    end

    error = ApiMaker::CommandFailedError.new(error_messages)
    error.api_maker_args = error_args
    error.api_maker_block = blk

    raise error
  end

  def succeed!(*, &)
    command.result(*, &)
  end

  def inspect
    "#<#{self.class.name}:#{__id__}>"
  end

private

  def serialized_model(model)
    collection_serializer = ApiMaker::CollectionSerializer.new(
      ability: current_ability,
      api_maker_args:,
      collection: [model],
      model_class: model.class,
      query_params: args&.dig(:query_params)
    )
    collection_serializer.result
  end

  def serialized_resource(model)
    ApiMaker::Serializer.new(ability: current_ability, api_maker_args:, model:)
  end
end
