class Services::CanCan::LoadAbilities < ApiMaker::BaseService
  def execute
    result = {
      custom: {},
      resources: {}
    }

    request.each do |type, subject_data|
      subject_data.each do |subject, abilities|
        abilities.each do |ability|
          if type == "custom"
            # Do nothing
          elsif type == "resources"
            resource = "Resources::#{subject}Resource".safe_constantize
            subject = resource.model_class
          else
            raise "Unknown type: #{type}"
          end

          can = current_ability.can?(ability, subject)

          result[type][subject] ||= {}
          result[type][subject][ability] = can
        end
      end
    end

    succeed!(abilities: result)
  end

  def request
    @request ||= args.fetch(:request)
  end
end
