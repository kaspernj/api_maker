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
          model: serializer.result
        )
      end
    end
  end
end
