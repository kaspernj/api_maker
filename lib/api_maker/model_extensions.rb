module ApiMaker::ModelExtensions
  def self.preloaded(base)
    base.extend(ClassMethods)
  end

  module ClassMethods
    def api_maker_broadcast_creates
      after_commit on: :create do |model| # rubocop:disable Style/SymbolProc
        model.api_maker_broadcast_create
      end
    end

    def api_maker_broadcast_create_channel_name
      @api_maker_broadcast_create_channel_name ||= "api_maker_creates_#{api_maker_resource.short_name}"
    end

    def api_maker_broadcast_updates
      after_commit on: :update do |model| # rubocop:disable Style/SymbolProc
        model.api_maker_broadcast_update
      end
    end

    def api_maker_broadcast_destroys
      after_commit on: :destroy do |model| # rubocop:disable Style/SymbolProc
        model.api_maker_broadcast_destroy
      end
    end

    def api_maker_resource
      @api_maker_resource ||= ApiMaker::MemoryStorage.current.resource_for_model(self)
    end
  end

  def api_maker_event(event_name, args = {})
    channel_name = api_maker_event_channel_name(event_name)
    serializer = ApiMaker::Serializer.new(model: self)
    data_to_broadcast = ApiMaker::ResultParser.parse(
      args: args,
      event_name: event_name,
      model_id: id,
      model_type: serializer.resource.collection_name,
      type: :event
    )
    ActionCable.server.broadcast(channel_name, data_to_broadcast)
  end

  def api_maker_event_channel_name(event_name)
    "api_maker_events_#{api_maker_resource.short_name}_#{id}_#{event_name}"
  end

  def api_maker_broadcast_create
    serializer = ApiMaker::Serializer.new(model: self)
    data_to_broadcast = ApiMaker::ResultParser.parse(
      model: self,
      model_class_name: self.class.name,
      model_id: id,
      model_type: serializer.resource.collection_name,
      type: :create
    )
    ActionCable.server.broadcast(self.class.api_maker_broadcast_create_channel_name, data_to_broadcast)
  end

  def api_maker_broadcast_destroy
    serializer = ApiMaker::Serializer.new(model: self)
    data_to_broadcast = ApiMaker::ResultParser.parse(
      model: self,
      model_id: id,
      model_type: serializer.resource.collection_name,
      type: :destroy
    )
    ActionCable.server.broadcast(api_maker_broadcast_destroy_channel_name, data_to_broadcast)
  end

  def api_maker_broadcast_destroy_channel_name
    @api_maker_broadcast_destroy_channel_name ||= "api_maker_destroys_#{api_maker_resource.short_name}_#{id}"
  end

  def api_maker_broadcast_update
    serializer = ApiMaker::Serializer.new(model: self)
    data_to_broadcast = ApiMaker::ResultParser.parse(
      model: self,
      model_id: id,
      model_type: serializer.resource.collection_name,
      type: :update
    )
    ActionCable.server.broadcast(api_maker_broadcast_update_channel_name, data_to_broadcast)
  end

  def api_maker_broadcast_update_channel_name
    @api_maker_broadcast_update_channel_name ||= "api_maker_updates_#{api_maker_resource.short_name}_#{id}"
  end

  def api_maker_resource
    @api_maker_resource ||= self.class.api_maker_resource
  end
end
