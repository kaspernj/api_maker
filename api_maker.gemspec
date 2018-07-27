$:.push File.expand_path("lib", __dir__)

# Maintain your gem's version:
require "api_maker/version"

# Describe your gem and declare its dependencies:
Gem::Specification.new do |s|
  s.name        = "api_maker"
  s.version     = ApiMaker::VERSION
  s.authors     = ["kjabtion"]
  s.email       = ["kj@abtion.com"]
  s.homepage    = "https://github.com/kaspernj/api_maker"
  s.summary     = "A Rails gem for generating a JavaScript API automatically based on your ActiveRecord models."
  s.description = "A Rails gem for generating a JavaScript API automatically based on your ActiveRecord models."
  s.license     = "MIT"

  s.files = Dir["{app,config,db,lib}/**/*", "MIT-LICENSE", "Rakefile", "README.md"]

  s.add_dependency "rails", "~> 5.2.0"
  s.add_runtime_dependency "cancancan"
  s.add_runtime_dependency "ransack"
  s.add_runtime_dependency "service_pattern"

  s.add_development_dependency "sqlite3"
end
