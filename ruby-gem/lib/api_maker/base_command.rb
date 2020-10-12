class ApiMaker::BaseCommand
  attr_reader :api_maker_args, :commands, :command_response, :collection, :controller, :current_ability

  # Returns true if the gem "goldiloader" is present in the app
  def self.goldiloader?
    @goldiloader = Gem::Specification.find_all_by_name("goldiloader").any? if @goldiloader.nil?
    @goldiloader
  end

  def initialize(ability:, args:, collection:, commands:, command_response:, controller:)
    @api_maker_args = args
    @current_ability = ability
    @collection = collection
    @commands = commands
    @command_response = command_response
    @controller = controller

    # Make it possible to do custom preloads (useful in threadded mode that doesnt support Goldiloader)
    @collection = custom_collection(@collection) if respond_to?(:custom_collection)
  end

  def locals
    @locals ||= ApiMaker::LocalsFromController.execute!(controller: controller)
  end

  def failure_response(errors:)
    command.fail(
      model: serialized_model(model),
      success: false,
      errors: errors
    )
  end

  def failure_save_response(model:, params:)
    command.fail(
      model: serialized_model(model),
      success: false,
      errors: model.errors.full_messages,
      validation_errors: ApiMaker::ValidationErrorsGeneratorService.execute!(model: model, params: params)
    )
  end

  def self.execute_in_thread!(**args)
    args.fetch(:command_response).with_thread do
      new(**args).execute!
    end
  end

  def each_command(args = {}, &blk)
    if args[:threadded]
      # Goldiloader doesn't work with threads (loads all relationships for each thread)
      @collection = @collection.auto_include(false) if ApiMaker::BaseCommand.goldiloader?

      # Load relationship before commands so each command doesn't query on its own
      @collection.load
    end

    commands.each do |command_id, command_data|
      if args[:threadded]
        command_response.with_thread do
          run_command(command_id, command_data, &blk)
        end
      else
        run_command(command_id, command_data, &blk)
      end
    end
  end

  delegate :result_for_command, to: :command_response

private

  def run_command(command_id, command_data)
    command = ApiMaker::IndividualCommand.new(
      args: ApiMaker::Deserializer.execute!(arg: command_data[:args]),
      collection: @collection,
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
        errors: [command_error_message(e)]
      }

      Rails.logger.error e.message
      Rails.logger.error e.backtrace.join("\n")

      ApiMaker::Configuration.current.report_error(controller: controller, error: e, response: error_response)

      command.error(error_response)
    end
  end

  def command_error_message(error)
    if Rails.application.config.consider_all_requests_local
      "#{error.class.name}: #{error.message}"
    else
      "Internal server error"
    end
  end

  def serialized_model(model)
    collection_serializer = ApiMaker::CollectionSerializer.new(
      ability: current_ability,
      args: api_maker_args,
      collection: [model],
      model_class: model.class,
      query_params: command.args&.dig(:query_params)
    )
    collection_serializer.result
  end

  def serialized_resource(model)
    ApiMaker::Serializer.new(ability: current_ability, args: api_maker_args, model: model)
  end
end
