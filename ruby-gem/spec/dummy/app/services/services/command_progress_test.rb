class Services::CommandProgressTest < ApiMaker::BaseService
  def perform
    current_command.total = 4
    current_command.increment!
    current_command.log("Started")
    current_command.progress = 0.5
    current_command.increment!

    succeed!(
      current_command_present: current_command.present?
    )
  end
end
