class ApiMaker::CollectionCommandService < ApiMaker::CommandService
  class CommandFailedError < RuntimeError; end

  def perform
    ApiMaker::Configuration.profile(-> { "CollectionCommand: #{namespace}::#{command_name}" }) do
      fail_with_no_access! unless authorized?

      constant.execute_in_thread!(
        ability: ability,
        api_maker_args: api_maker_args,
        collection: nil,
        commands: commands,
        command_response: command_response,
        controller: controller
      )
    end

    succeed!
  rescue CommandFailedError => e
    commands.each_key do |command_id|
      command_response.error_for_command(
        command_id,
        success: false,
        errors: [e.message]
      )
    end

    succeed!
  end

  def authorized?
    ability.can?(command_name.to_sym, model_class)
  end

  def constant_name
    @constant_name ||= "Commands::#{namespace}::#{command_name.camelize}"
  end

  def constant
    @constant ||= constant_name.constantize
  rescue NameError => e
    fail! "Invalid command: #{constant_name}"
  end

  def fail!(message)
    raise CommandFailedError, message
  end

  def fail_with_no_access
    fail! "No access to '#{command_name}' on '#{model_class.name}'"
  end
end
