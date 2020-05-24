class Services::CanCan::LoadAbilities < ApiMaker::BaseService
  attr_reader :request

  def execute
    response = {}

    request.each do |subject, abilities|
      abilities.each do |ability|
        can = current_ability.can?(ability, subject)

        response[subject] ||= {}
        response[subject][ability] = can
      end
    end

    succeed!(response: response)
  end

  def request
    @request ||= args.fetch(:request)
  end
end
