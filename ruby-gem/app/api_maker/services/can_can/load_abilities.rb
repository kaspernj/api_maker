class Services::CanCan::LoadAbilities < Services::ApplicationService
  def execute
    response = {}

    args.fetch(:requests).each do |request|
      ability = request.fetch(:ability)
      subject = request.fetch(:subject)

      can = current_ability.can?(ability.fetch(:ability), ability.fetch(:subject))

      response[subject] ||= {}
      response[subject][ability] = can
    end

    succeed!(response: response)
  end
end
