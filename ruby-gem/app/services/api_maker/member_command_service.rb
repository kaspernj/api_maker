class ApiMaker::MemberCommandService < ApiMaker::CommandService
  def perform
    ApiMaker::Configuration.profile(-> { "MemberCommand execute: #{model_class.name}##{command_name}" }) do
      ability_name = command_name.to_sym
      collection = model_class.accessible_by(@ability, ability_name).where(model_class.primary_key => ids)

      constant.execute_in_thread!(
        ability: ability,
        api_maker_args: api_maker_args,
        collection: collection,
        commands: commands,
        command_response: command_response,
        controller: controller
      )

      succeed!
    end
  end

  def constant
    @constant ||= "Commands::#{namespace}::#{command_name.camelize}".constantize
  end

  def ids
    @commands.values.map { |command| command.fetch("primary_key") }
  end
end
