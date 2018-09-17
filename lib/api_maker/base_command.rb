class ApiMaker::BaseCommand
  attr_reader :args, :controller

  def initialize(args:, controller:)
    @args = args
    @controller = controller
  end
end
