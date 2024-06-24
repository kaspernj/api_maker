class Services::CanCan::LoadAbilities < ApiMaker::BaseService
  def perform
    result = []

    request.each do |ability_data|
      # Sometimes Rails passes a hash instead of an array
      ability_data = ability_data.fetch(1) if ability_data.is_a?(Array)

      ability = ability_data.fetch("ability")
      subject = ability_data.fetch("subject")
      subject_to_check = subject

      # Convert subject to original model class if resource is given
      subject_to_check = subject.model_class if subject.is_a?(Class) && subject < ApiMaker::BaseResource

      can = current_ability.can?(ability.to_sym, subject_to_check)
      result << {
        ability:,
        can:,
        subject:
      }
    end

    succeed!(abilities: result)
  end

  def request
    @request ||= args.fetch(:request)
  end
end
