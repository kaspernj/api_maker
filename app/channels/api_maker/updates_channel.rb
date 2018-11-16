class ApiMaker::UpdatesChannel < ApplicationCable::Channel
  def subscribed
    model_class = params[:model].safe_constantize
    model = model_class.accessible_by(current_ability, :update_events).find(params[:id])

    channel_name = "api_maker_updates_#{model.class.name}_#{model.id}"
    stream_from(channel_name, coder: ActiveSupport::JSON) do |data|
      transmit data
    end
  end
end
