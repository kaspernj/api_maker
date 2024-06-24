class Services::Models::FindOrCreateBy < ApiMaker::BaseService
  def perform
    resource_name = args.fetch(:resource_name)
    resource = "Resources::#{resource_name}Resource".safe_constantize
    model_class = resource.model_class
    find_or_create_by_args = args.fetch(:find_or_create_by_args)
    additional_data = args[:additional_data]

    model = model_class.find_or_initialize_by(find_or_create_by_args)
    model.assign_attributes(additional_data) if model.new_record? && additional_data

    if model.save
      succeed!(model:)
    else
      fail! errors: model.errors.full_messages
    end
  end
end
