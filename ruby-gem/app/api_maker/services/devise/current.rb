class Services::Devise::Current < ApiMaker::BaseService
  def perform
    scope = args.dig(:args, :scope).presence || "user"
    devise_mapping = Devise.mappings.fetch(scope.to_sym)
    model_class = devise_mapping.class_name.safe_constantize
    model_id = controller.__send__(:"current_#{scope}")&.id
    current_model = controller.__send__(:"current_#{scope}")
    model_class = current_model&.class
    query = args[:query]
    collection_serializer = ApiMaker::CollectionSerializer.new(
      ability: current_ability,
      api_maker_args:,
      collection: model_id ? model_class.where(id: model_id) : [],
      locals: api_maker_locals,
      model_class:,
      query_params: query&.query_params
    )
    succeed!(current: collection_serializer)
  end
end
