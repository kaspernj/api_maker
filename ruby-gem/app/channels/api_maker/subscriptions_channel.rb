class ApiMaker::SubscriptionsChannel < ApplicationCable::Channel
  def subscribed
    if respond_to?(:around_api_maker_subscribe_to_events)
      around_api_maker_subscribe_to_events do
        subscribe_to_events!
      end
    else
      subscribe_to_events!
    end
  end

private

  def subscribe_to_events!
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

  def connect_creates(model_name)
    ability_name = :create_events
    model_class = model_for_resource_name(model_name)

    unless model_class.respond_to?(:api_maker_broadcast_create_channel_name)
      error_message = "The model #{model_class.name} doesn't support the static method 'api_maker_broadcast_create_channel_name'. " \
                      "Maybe API maker extensions haven't been included?"

      raise error_message
    end

    channel_name = model_class.api_maker_broadcast_create_channel_name
    stream_from(channel_name, coder: ActiveSupport::JSON) do |data|
      ApiMaker::Configuration.current.before_create_event_callbacks.each do |callback|
        callback.call(data:)
      end

      # We need to look the model up to evaluate if the user has access
      model_class = data.fetch("mcn").safe_constantize

      Rails.logger.debug { "API maker: ConnectCreates for #{model_class.name}" }
      model_exists = model_class
        .accessible_by(current_ability, ability_name)
        .exists?(model_class.primary_key => data.fetch("mi"))

      # Transmit the data to JS if its found (and thereby allowed)
      if model_exists
        transmit data
      else
        Rails.logger.warn { "API maker: No access to connect to #{model_class.name} #{ability_name}" }
      end
    end
  end

  def connect_destroys(model_name, model_ids)
    ability_name = :destroy_events
    model_class = model_for_resource_name(model_name)

    Rails.logger.debug { "API maker: ConnectDestroys for #{model_class.name}" }
    accessible_model_ids = model_class
      .accessible_by(current_ability, ability_name)
      .where(model_class.primary_key => model_ids)
      .ids

    accessible_model_ids.each do |accessible_model_id|
      channel_name = model_class.api_maker_broadcast_destroy_channel_name(accessible_model_id)
      stream_from(channel_name, coder: ActiveSupport::JSON) do |data|
        transmit data
      end
    end

    report_unaccessible_model_ids(model_class, model_ids, accessible_model_ids, ability_name)
  end

  def connect_event(model_name, model_ids, event_name)
    ability_name = :"event_#{event_name}"
    model_class = model_for_resource_name(model_name)

    Rails.logger.debug { "API maker: ConnectEvents for #{model_class.name} #{event_name}" }
    accessible_model_ids = model_class
      .accessible_by(current_ability, ability_name)
      .where(model_class.primary_key => model_ids)
      .ids

    accessible_model_ids.each do |accessible_model_id|
      channel_name = model_class.api_maker_event_channel_name(accessible_model_id, event_name)
      stream_from(channel_name, coder: ActiveSupport::JSON) do |data|
        transmit data
      end
    end

    report_unaccessible_model_ids(model_class, model_ids, accessible_model_ids, ability_name)
  end

  def connect_model_class_event(model_name, event_name)
    ability_name = :"model_class_event_#{event_name}"
    model_class = model_for_resource_name(model_name)
    channel_name = model_class.api_maker_model_class_event_name(event_name)

    Rails.logger.debug { "API maker: ConnectModelClassEvent for #{model_class.name} #{event_name}" }

    if current_ability.can?(ability_name, model_class)
      stream_from(channel_name, coder: ActiveSupport::JSON) do |data|
        transmit data
      end
    else
      Rails.logger.warn { "API maker: No access to model class event #{model_class.name}##{event_name} with ability name: #{ability_name}" }
    end
  end

  def connect_updates(model_name, model_ids)
    ability_name = :update_events
    model_class = model_for_resource_name(model_name)

    Rails.logger.debug { "API maker: ConnectUpdates for #{model_class.name}" }
    accessible_model_ids = model_class
      .accessible_by(current_ability, ability_name)
      .where(model_class.primary_key => model_ids)
      .ids

    accessible_model_ids.each do |accessible_model_id|
      channel_name = model_class.api_maker_broadcast_update_channel_name(accessible_model_id)
      stream_from(channel_name, coder: ActiveSupport::JSON) do |data|
        transmit data
      end
    end

    report_unaccessible_model_ids(model_class, model_ids, accessible_model_ids, ability_name)
  end

  def model_for_resource_name(resource_name)
    resource_for_resource_name(resource_name).model_class
  end

  def report_unaccessible_model_ids(model_class, model_ids, accessible_model_ids, ability_name)
    model_ids = model_ids.map(&:to_s)
    accessible_model_ids = accessible_model_ids.map(&:to_s)
    unaccessible_model_ids = model_ids - accessible_model_ids

    if unaccessible_model_ids.any?
      Rails.logger.warn { "API maker: No access to connect to #{model_class.name} #{ability_name} for IDs: #{unaccessible_model_ids.join(", ")}" }
    end
  end

  def resource_for_resource_name(resource_name)
    resource = "Resources::#{resource_name}Resource".safe_constantize
    raise "Cannot find resource by resource name: #{resource_name}" unless resource

    resource
  end
end
