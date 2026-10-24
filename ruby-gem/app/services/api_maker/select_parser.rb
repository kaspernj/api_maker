class ApiMaker::SelectParser < ApiMaker::ApplicationService
  attr_reader :select

  # Process-wide counter so repeated unknown-attribute rejections stay
  # observable in the logs even though each request only sees its own
  # occurrence. The command executor and the websocket channel log it together
  # with the request details (path, method, user agent) so the calling client
  # can be identified.
  # Cannot be frozen: the mutex-guarded increment writes to it.
  # rubocop:disable Style/MutableConstant
  UNKNOWN_SELECT_ATTRIBUTE_COUNTER = {count: 0}
  # rubocop:enable Style/MutableConstant
  UNKNOWN_SELECT_ATTRIBUTE_COUNTER_MUTEX = Mutex.new

  def self.unknown_select_attribute_count
    UNKNOWN_SELECT_ATTRIBUTE_COUNTER[:count]
  end

  def initialize(select:)
    @select = select
  end

  def perform
    new_select = {}

    select.each do |model_collection_name, attributes|
      model_class = model_collection_name.underscore.singularize.camelize
      resource = "Resources::#{model_class}Resource".safe_constantize
      raise "Resource not found for: #{model_collection_name}" unless resource

      selects = {}
      new_select[resource.model_class] ||= selects
      resource_attributes = resource._attributes_with_string_keys

      attributes.each do |attribute|
        resource_attribute = resource_attributes[attribute]

        # Unknown attribute: a client/API contract disagreement. Reject it
        # loudly (never skip or ignore) but as a dedicated client-contract
        # error class so the command endpoints answer 4xx naming the resource
        # and the attribute instead of a 500 RuntimeError that files a bug
        # report.
        unless resource_attribute
          UNKNOWN_SELECT_ATTRIBUTE_COUNTER_MUTEX.synchronize { UNKNOWN_SELECT_ATTRIBUTE_COUNTER[:count] += 1 }

          raise ApiMaker::UnknownSelectAttributeError, "Attribute not found on the #{resource.short_name} resource: #{attribute}"
        end

        selects[attribute.to_sym] = resource_attribute
      end

      new_select[resource.model_class] = selects
    end

    succeed! new_select
  end
end
