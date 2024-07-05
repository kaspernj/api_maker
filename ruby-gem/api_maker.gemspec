$LOAD_PATH.push File.expand_path("lib", __dir__)

# Maintain your gem's version:
require "api_maker/version"

# Describe your gem and declare its dependencies:
Gem::Specification.new do |s|
  s.name        = "api_maker"
  s.version     = ApiMaker::VERSION
  s.authors     = ["kaspernj"]
  s.email       = ["kaspernj@gmail.com"]
  s.homepage    = "https://github.com/kaspernj/api_maker"
  s.summary     = "A Rails gem for generating a JavaScript API automatically based on your ActiveRecord models."
  s.description = "A Rails gem for generating a JavaScript API automatically based on your ActiveRecord models."
  s.license     = "MIT"
  s.required_ruby_version = ">= 3.2.0"
  s.metadata["rubygems_mfa_required"] = "true"

  s.files = Dir["{app,config,db,lib}/**/*", "MIT-LICENSE", "Rakefile", "README.md"]

  s.add_dependency "rails", ">= 6.0.0"
  s.add_dependency "waitutil"

  s.add_runtime_dependency "active_record_better_dependent_error_messages", ">= 0.0.3"
  s.add_runtime_dependency "active_record_query_fixer", ">= 0.0.15"
  s.add_runtime_dependency "cancancan"
  s.add_runtime_dependency "dig_bang"
  s.add_runtime_dependency "ransack"
  s.add_runtime_dependency "service_pattern", ">= 1.0.5"
  s.add_runtime_dependency "with_advisory_lock"
end
