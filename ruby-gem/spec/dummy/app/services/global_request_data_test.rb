module Services
  class GlobalRequestDataTest < ApiMaker::BaseService
    def perform
      global_data = controller&.params&.fetch(:global, {}) || {}
      global_data = global_data.to_unsafe_h if global_data.respond_to?(:to_unsafe_h)

      succeed!(global: global_data)
    end
  end
end
