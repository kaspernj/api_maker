class ApiMaker::CollectionCommandService < ApiMaker::CommandService
  def execute
    if authorized?
      constant.execute_in_thread!(
        ability: ability,
        args: args,
        collection: nil,
        commands: commands,
        command_response: command_response,
        controller: controller,
        locals: locals
      )
    else
      fail_with_no_access
    end

    succeed!
  end

  def authorized?
    ability.can?(command_name.to_sym, model_class)
  end

  def constant
    @constant ||= "Commands::#{namespace}::#{command_name.camelize}".constantize
  end

  def fail_with_no_access
    commands.each_key do |command_id|
      command_response.error_for_command(
        command_id,
        success: false,
        errors: ["No access to '#{command_name}' on '#{model_class.name}'"]
      )
    end
  end
end
