require_relative "lib/api_maker_table/version"

Gem::Specification.new do |spec|
  spec.name        = "api_maker_table"
  spec.version     = ApiMakerTable::VERSION
  spec.authors     = ["kaspernj"]
  spec.email       = ["k@spernj.org"]
  spec.homepage    = "https://github.com/kaspernj/api_maker"
  spec.summary     = "A Rails gem for generating a JavaScript API automatically based on your ActiveRecord models."
  spec.description = "A Rails gem for generating a JavaScript API automatically based on your ActiveRecord models."
  spec.license     = "MIT"

  spec.files = Dir.chdir(File.expand_path(__dir__)) do
    Dir["{app,config,db,lib}/**/*", "MIT-LICENSE", "Rakefile", "README.md"]
  end

  spec.add_dependency "rails", ">= 6.0.0"
  spec.add_dependency "service_pattern"
  spec.add_dependency "worker_plugins", ">= 0.0.6"
end
