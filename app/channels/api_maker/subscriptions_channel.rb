class ApiMaker::SubscriptionsChannel < ApplicationCable::Channel
  def subscribed
    params[:subscription_data].each do |model_name, subscription_types|
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
    model_class = model_name.safe_constantize
    channel_name = "api_maker_creates_#{model_class}"
    stream_from(channel_name, coder: ActiveSupport::JSON) do |data|
      # We need to look the model up to evaluate if the user has access
      model = data.fetch("model_class_name").safe_constantize.find(data.fetch("model_id"))

      # Transmit the data to JS if its allowed
      transmit data if current_ability.can?(:create_events, model)
    end
  end

  def connect_destroys(model_name, model_ids)
    model_class = model_name.safe_constantize
    models = model_class.accessible_by(current_ability, :destroy_events).where(model_class.primary_key => model_ids)
    models.each do |model|
      channel_name = "api_maker_destroys_#{model_class}_#{model.id}"
      stream_from(channel_name, coder: ActiveSupport::JSON) do |data|
        transmit data
      end
    end
  end

  def connect_event(model_name, model_ids, event_name)
    ability_name = "event_#{event_name}".to_sym
    model_class = model_name.safe_constantize
    models = model_class.accessible_by(current_ability, ability_name).where(model_class.primary_key => model_ids)
    models.each do |model|
      channel_name = "api_maker_events_#{model_class}_#{model.id}_#{event_name}"
      stream_from(channel_name, coder: ActiveSupport::JSON) do |data|
        transmit data
      end
    end
  end

  def connect_updates(model_name, model_ids)
    model_class = model_name.safe_constantize
    models = model_class.accessible_by(current_ability, :update_events).where(model_class.primary_key => model_ids)
    models.each do |model|
      channel_name = "api_maker_updates_#{model_class}_#{model.id}"
      stream_from(channel_name, coder: ActiveSupport::JSON) do |data|
        transmit data
      end
    end
  end
end
