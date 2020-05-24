class ApiMaker::SubscriptionsChannel < ApplicationCable::Channel
  def subscribed
    params[:subscription_data].each do |model_name, subscription_types|
      subscription_types["model_class_events"]&.each do |event_name|
        connect_model_class_event(model_name, event_name)
      end

      subscription_types["events"]&.each do |event_name, model_ids|
        connect_event(model_name, model_ids, event_name)
      end

      connect_creates(model_name) if subscription_types.key?("creates")

      if subscription_types.key?("updates")
        model_ids = subscription_types.fetch("updates")
        connect_updates(model_name, model_ids)
      end

      if subscription_types.key?("destroys")
        model_ids = subscription_types.fetch("destroys")
        connect_destroys(model_name, model_ids)
      end
    end
  end

private

  def connect_creates(model_name)
    model_class = model_for_resource_name(model_name)
    channel_name = model_class.api_maker_broadcast_create_channel_name
    stream_from(channel_name, coder: ActiveSupport::JSON) do |data|
      # We need to look the model up to evaluate if the user has access
      model = data.fetch("model_class_name").safe_constantize.accessible_by(current_ability, :create_events).find(data.fetch("model_id"))

      # Transmit the data to JS if its allowed
      transmit data if model
    end
  end

  def connect_destroys(model_name, model_ids)
    model_class = model_for_resource_name(model_name)
    models = model_class.accessible_by(current_ability, :destroy_events).where(model_class.primary_key => model_ids)
    models.each do |model|
      channel_name = model.api_maker_broadcast_destroy_channel_name
      stream_from(channel_name, coder: ActiveSupport::JSON) do |data|
        transmit data
      end
    end
  end

  def connect_event(model_name, model_ids, event_name)
    ability_name = "event_#{event_name}".to_sym
    model_class = model_for_resource_name(model_name)
    models = model_class.accessible_by(current_ability, ability_name).where(model_class.primary_key => model_ids)
    models.each do |model|
      channel_name = model.api_maker_event_channel_name(event_name)
      stream_from(channel_name, coder: ActiveSupport::JSON) do |data|
        transmit data
      end
    end
  end

  def connect_model_class_event(model_name, event_name)
    ability_name = "model_class_event_#{event_name}".to_sym
    model_class = model_for_resource_name(model_name)
    channel_name = model_class.api_maker_model_class_event_name(event_name)

    if current_ability.can?(ability_name, model_class)
      stream_from(channel_name, coder: ActiveSupport::JSON) do |data|
        transmit data
      end
    else
      Rails.logger.warn "API maker: No access to model class event #{model_class.name}##{event_name} with ability name: #{ability_name}"
    end
  end

  def connect_updates(model_name, model_ids)
    model_class = model_for_resource_name(model_name)
    models = model_class.accessible_by(current_ability, :update_events).where(model_class.primary_key => model_ids)
    models.each do |model|
      channel_name = model.api_maker_broadcast_update_channel_name
      stream_from(channel_name, coder: ActiveSupport::JSON) do |data|
        transmit data
      end
    end
  end

  def model_for_resource_name(resource_name)
    resource_for_resource_name(resource_name).model_class
  end

  def resource_for_resource_name(resource_name)
    resource = "Resources::#{resource_name}Resource".safe_constantize
    raise "Cannot find resource by resource name: #{resource_name}" unless resource

    resource
  end
end
