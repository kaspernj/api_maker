class ApiMaker::SubscriptionsChannel < ApplicationCable::Channel
  def subscribed
    puts params

    params[:subscription_data].each do |model_name, subscription_types|
      subscription_types["events"]&.each_key do |event_name, models|
        connect_event(model_name, models.keys, event_name)
      end

      if subscription_types.key?("updates")
        model_ids = subscription_types.fetch("updates")
        connect_updates(model_name, model_ids)
      end
    end
  end

private

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
