class ApiMaker::CommandResponse
  attr_reader :result

  def initialize
    @result = {}
  end

  def fail_for_command(id, data)
    @result[id] = {type: :failed, data: data}
  end

  def result_for_command(id, data)
    @result[id] = {type: :success, data: data}
  end
end
