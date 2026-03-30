# rubocop:disable Style/OneClassPerFile
module ApiMaker; end

class ApiMaker::Engine < Rails::Engine
  isolate_namespace ApiMaker
end
# rubocop:enable Style/OneClassPerFile
