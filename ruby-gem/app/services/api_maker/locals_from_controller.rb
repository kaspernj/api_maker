class ApiMaker::LocalsFromController < ApiMaker::ApplicationService
  attr_reader :controller

  def initialize(controller:)
    @controller = controller
  end

  def execute
    variable_name = :@api_maker_locals
    controller.instance_variable_set(variable_name, {}) unless controller.instance_variable_defined?(variable_name)
    variable = controller.instance_variable_get(variable_name)
    succeed! variable
  end
end
