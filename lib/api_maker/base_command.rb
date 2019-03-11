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

    @commands.each do |command_id, command_data|
      if args[:threadded]
        command_response.with_thread do
          run_command(command_id, command_data, &blk)
        end
      else
        run_command(command_id, command_data, &blk)
      end
    end
  end

  def result_for_command(id, data)
    command_response.result_for_command(id, data)
  end

private

  def run_command(command_id, command_data)
    command = ApiMaker::IndividualCommand.new(
      args: command_data[:args],
      collection: @collection,
      command: self,
      id: command_id,
      primary_key: command_data[:primary_key],
      response: command_response
    )

    begin
      yield command
    rescue => e # rubocop:disable Style/RescueStandardError
      command.fail(success: false, errors: ["Internal server error"])

      Rails.logger.error e.message
      Rails.logger.error e.backtrace.join("\n")

      ApiMaker::Configuration.current.report_error(e)
    end
  end
end
