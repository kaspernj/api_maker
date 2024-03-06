module ApiMaker::ModelExtensions
  def self.included(base)
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

    def api_maker_broadcast_destroy_channel_name(id)
      "api_maker_destroys_#{api_maker_resource.short_name}_#{id}"
    end

    def api_maker_event_channel_name(id, event_name)
      "api_maker_events_#{api_maker_resource.short_name}_#{id}_#{event_name}"
    end

    def api_maker_broadcast_update_channel_name(id)
      "api_maker_updates_#{api_maker_resource.short_name}_#{id}"
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

    def api_maker_event(event_name, args = {})
      channel_name = api_maker_model_class_event_name(event_name)
      resource = ApiMaker::MemoryStorage.current.resource_for_model(self)
      data_to_broadcast = ApiMaker::ResultParser.parse(
        {
          a: args,
          e: event_name,
          mt: resource.collection_name,
          t: :mce
        }
      )
      ActionCable.server.broadcast(channel_name, data_to_broadcast)
    end

    def api_maker_model_class_event_name(event_name)
      "api_maker_model_class_events_#{api_maker_resource.short_name}_#{event_name}"
    end

    def api_maker_resource
      @api_maker_resource ||= ApiMaker::MemoryStorage.current.resource_for_model(self)
    end

    def translated_collection(collection_name, allow_blank: false, helper_methods: true, helper_methods_prepend: false, &blk)
      ApiMaker::TranslatedCollections.add(
        allow_blank: allow_blank,
        blk: blk,
        collection_name: collection_name,
        helper_methods: helper_methods,
        helper_methods_prepend: helper_methods_prepend,
        model_class: self
      )
    end
  end

  def api_maker_event(event_name, args = {})
    channel_name = api_maker_event_channel_name(event_name)
    serializer = ApiMaker::Serializer.new(model: self)
    data_to_broadcast = ApiMaker::ResultParser.parse(
      {
        a: args,
        e: event_name,
        mi: id,
        mt: serializer.resource.collection_name,
        t: :e
      }
    )
    ActionCable.server.broadcast(channel_name, data_to_broadcast)
  end

  def api_maker_event_channel_name(event_name)
    self.class.api_maker_event_channel_name(id, event_name)
  end

  def api_maker_broadcast_create
    serializer = ApiMaker::Serializer.new(model: self)
    data_to_broadcast = ApiMaker::ResultParser.parse(
      {
        m: self,
        mcn: model_name.name,
        mi: id,
        mt: serializer.resource.collection_name,
        t: :c
      }
    )
    ActionCable.server.broadcast(self.class.api_maker_broadcast_create_channel_name, data_to_broadcast)
  end

  def api_maker_broadcast_destroy
    serializer = ApiMaker::Serializer.new(model: self)
    data_to_broadcast = ApiMaker::ResultParser.parse(
      {
        m: self,
        mi: id,
        mt: serializer.resource.collection_name,
        t: :d
      }
    )
    ActionCable.server.broadcast(api_maker_broadcast_destroy_channel_name, data_to_broadcast)
  end

  def api_maker_broadcast_destroy_channel_name
    @api_maker_broadcast_destroy_channel_name ||= self.class.api_maker_broadcast_destroy_channel_name(id)
  end

  def api_maker_broadcast_update
    serializer = ApiMaker::Serializer.new(model: self)
    data_to_broadcast = ApiMaker::ResultParser.parse(
      {
        m: self,
        mi: id,
        mt: serializer.resource.collection_name,
        t: :u
      }
    )
    ActionCable.server.broadcast(api_maker_broadcast_update_channel_name, data_to_broadcast)
  end

  def api_maker_broadcast_update_channel_name
    self.class.api_maker_broadcast_update_channel_name(id)
  end

  def api_maker_resource
    @api_maker_resource ||= self.class.api_maker_resource
  end
end
