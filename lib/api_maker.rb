require "api_maker/engine"

require "active_record_query_fixer"
require "ransack"
require "service_pattern"

require_relative "api_maker/action_controller_base_extensions"

module ApiMaker
  dir = "#{__dir__}/api_maker"

  autoload :BaseCommand, "#{dir}/base_command"
  autoload :BaseResource, "#{dir}/base_resource"
  autoload :CollectionSerializer, "#{dir}/collection_serializer"
  autoload :Loader, "#{dir}/loader"
  autoload :MemoryStorage, "#{dir}/memory_storage"
  autoload :RelationshipIncluder, "#{dir}/relationship_includer"
  autoload :Routing, "#{dir}/routing"
  autoload :Serializer, "#{dir}/serializer"
end
