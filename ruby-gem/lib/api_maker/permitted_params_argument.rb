class ApiMaker::PermittedParamsArgument
  attr_reader :command, :model

  def initialize(command:, model:)
    @command = command
    @model = model
  end

  def inspect
    "#<#{self.class.name}:#{__id__}>"
  end

  def params
    @params ||= begin
      raw_params = command.args&.dig(:save) || {}

      if raw_params.is_a?(ActionController::Parameters)
        raw_params
      else
        ActionController::Parameters.new(raw_params)
      end
    end
  end
end
