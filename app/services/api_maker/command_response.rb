class ApiMaker::CommandResponse
  attr_reader :result

  def initialize
    @result = {}
  end

  def result_for_command(id, data)
    @result[id] = {type: :success, data: data}
  end
end
