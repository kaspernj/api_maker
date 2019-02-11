class ApiMaker::ValidCommand < ApiMaker::BaseCommand
  attr_reader :command, :model, :params, :serializer

  def execute!
    each_command do |command|
      @command = command
      @params = command.args || {}

      if sanitize_parameters[:id]
        instance = resource_instance_class.find(sanitize_parameters[:id])
        instance.assign_attributes(sanitize_parameters)
      else
        instance = resource_instance_class.new(sanitize_parameters)
      end

      render json: {valid: instance.valid?, errors: instance.errors.full_messages}
    end
  end

  def sanitize_parameters
    serializer.resource_instance.permitted_params(params)
  end

  def serialized_resource(model)
    ApiMaker::Serializer.new(ability: current_ability, args: api_maker_args, model: model)
  end
end
