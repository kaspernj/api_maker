class Services::CanCan::LoadAbilities < ApiMaker::BaseService
  attr_reader :request

  def execute
    result = {}

    request.each do |subject, abilities|
      abilities.each do |ability|
        can = current_ability.can?(ability, subject)

        result[subject] ||= {}
        result[subject][ability] = can
      end
    end

    succeed!(abilities: result)
  end

  def request
    @request ||= args.fetch(:request)
  end
end
