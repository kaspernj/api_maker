class ApiMaker::BaseCommand
  attr_reader :args, :controller, :model

  delegate :current_user, :params, :render, :signed_in?, to: :controller

  def initialize(args:, controller:, model:)
    @args = args
    @controller = controller
    @model = model
  end
end
