require "api_maker/engine"

require "active_record_query_fixer"
require "ransack"
require "service_pattern"

require_relative "api_maker/action_controller_base_extensions"

module ApiMaker
  dir = "#{__dir__}/api_maker"

  autoload :Ability, "#{dir}/ability"
  autoload :AbilityLoader, "#{dir}/ability_loader"
  autoload :BaseCommand, "#{dir}/base_command"
  autoload :BaseResource, "#{dir}/base_resource"
  autoload :BaseService, "#{dir}/base_service"
  autoload :CollectionSerializer, "#{dir}/collection_serializer"
  autoload :CommandSpecHelper, "#{dir}/command_spec_helper"
  autoload :Configuration, "#{dir}/configuration"
  autoload :IndividualCommand, "#{dir}/individual_command"
  autoload :Loader, "#{dir}/loader"
  autoload :MemoryStorage, "#{dir}/memory_storage"
  autoload :ModelExtensions, "#{dir}/model_extensions"
  autoload :PermittedParamsArgument, "#{dir}/permitted_params_argument"
  autoload :Preloader, "#{dir}/preloader"
  autoload :PreloaderBase, "#{dir}/preloader_base"
  autoload :PreloaderBelongsTo, "#{dir}/preloader_belongs_to"
  autoload :PreloaderHasMany, "#{dir}/preloader_has_many"
  autoload :PreloaderHasOne, "#{dir}/preloader_has_one"
  autoload :RelationshipPreloader, "#{dir}/relationship_preloader"
  autoload :ResourceRouting, "#{dir}/resource_routing"
  autoload :ResultParser, "#{dir}/result_parser"
  autoload :Serializer, "#{dir}/serializer"
  autoload :SpecHelper, "#{dir}/spec_helper"
end

require_relative "api_maker/railtie"
