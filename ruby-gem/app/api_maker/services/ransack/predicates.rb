class Services::Ransack::Predicates < ApiMaker::BaseService
  def perform
    succeed!(
      predicates: predicates.values.map do |predicate|
        {
          case_insensitive: predicate.case_insensitive,
          name: predicate.name,
          wants_array: predicate.wants_array
        }
      end
    )
  end

  def predicates
    Ransack.predicates.instance_variable_get(:@collection)
  end
end
