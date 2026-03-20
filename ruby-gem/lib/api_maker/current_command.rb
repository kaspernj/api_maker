class ApiMaker::CurrentCommand
  attr_reader :command_id, :command_response, :count, :total

  def initialize(command_id:, command_response:)
    @command_id = command_id
    @command_response = command_response
  end

  def count=(value)
    @count = value
    transmit_progress
  end

  def increment!(by = 1)
    self.count = (count || 0) + by
  end

  def log(message)
    command_response.log_for_command(command_id, message.to_s)
  end

  def progress=(value)
    @explicit_progress = value
    transmit_progress
  end

  def total=(value)
    @total = value
    transmit_progress
  end

private

  def current_progress
    return @explicit_progress unless @explicit_progress.nil?
    return unless count
    return unless total
    return if total.to_f.zero?

    count.to_f / total
  end

  def transmit_progress
    payload = {}
    payload[:count] = count unless count.nil?
    payload[:progress] = current_progress unless current_progress.nil?
    payload[:total] = total unless total.nil?

    command_response.progress_for_command(command_id, payload) unless payload.empty?
  end
end
