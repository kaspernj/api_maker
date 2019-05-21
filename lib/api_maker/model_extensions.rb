module ApiMaker::ModelExtensions
  def self.included(base)
    base.extend(ClassMethods)
  end

  module ClassMethods
    def api_maker_broadcast_updates
      after_commit on: :update do |model|
        channel_name = "api_maker_updates_#{model.class.name}_#{model.id}"
        serializer = ApiMaker::Serializer.new(model: model)

        ActionCable.server.broadcast(
          channel_name,
          model: serializer,
          model_id: model.id,
          model_type: serializer.resource.collection_name,
          type: :update
        )
      end

      after_commit on: :destroy do |model|
        channel_name = "api_maker_destroys_#{model.class.name}_#{model.id}"
        serializer = ApiMaker::Serializer.new(model: model)

        ActionCable.server.broadcast(
          channel_name,
          model: serializer,
          model_id: model.id,
          model_type: serializer.resource.collection_name,
          type: :destroy
        )
      end
    end
  end

  def api_maker_event(event_name, args = {})
    channel_name = "api_maker_events_#{self.class.name}_#{id}_#{event_name}"
    serializer = ApiMaker::Serializer.new(model: self)

    ActionCable.server.broadcast(
      channel_name,
      args: args,
      event_name: event_name,
      model: serializer,
      model_id: id,
      model_type: serializer.resource.collection_name,
      type: :event
    )
  end
end
