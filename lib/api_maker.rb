require "api_maker/engine"

require "active_model_serializers"
require "active_record_query_fixer"
require "ransack"
require "service_pattern"

module ApiMaker
  dir = "#{__dir__}/api_maker"

  autoload :BaseCommand, "#{dir}/base_command"
  autoload :BaseResource, "#{dir}/base_resource"
  autoload :Loader, "#{dir}/loader"
  autoload :MemoryStorage, "#{dir}/memory_storage"
  autoload :Routing, "#{dir}/routing"
end
