class ApiMaker::EventsChannel < ApplicationCable::Channel
  def subscribed
    ability_name = "event_#{params[:event]}".to_sym
    model_class = params[:model].safe_constantize
    model = model_class.accessible_by(current_ability, ability_name).find(params[:id])

    channel_name = "api_maker_events_#{model.class.name}_#{model.id}_#{params[:event]}"
    stream_from(channel_name, coder: ActiveSupport::JSON) do |data|
      transmit data
    end
  end
end
