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
  s.required_ruby_version = ">= 2.6.0"
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

  # s.add_development_dependency "api_maker_table", ">= 0.1.1"
  s.add_development_dependency "appraisal"
  s.add_development_dependency "awesome_translations", ">= 0.0.62"
  s.add_development_dependency "best_practice_project"
  s.add_development_dependency "capybara"
  s.add_development_dependency "devise"
  s.add_development_dependency "dotenv-rails"
  s.add_development_dependency "factory_bot_rails"
  s.add_development_dependency "htmlbeautifier"
  s.add_development_dependency "js-routes", "2.0.8"
  s.add_development_dependency "money-rails"
  s.add_development_dependency "pry-rails"
  s.add_development_dependency "public_activity"
  s.add_development_dependency "puma"
  s.add_development_dependency "rails_best_practices"
  s.add_development_dependency "rspec-rails"
  s.add_development_dependency "rspec-retry"
  s.add_development_dependency "rubocop"
  s.add_development_dependency "rubocop-performance"
  s.add_development_dependency "rubocop-rails"
  s.add_development_dependency "rubocop-rspec"
  s.add_development_dependency "selenium-webdriver", ">= 4.1.0"
  s.add_development_dependency "shakapacker", "7.2.1"
  s.add_development_dependency "sqlite3"
  s.add_development_dependency "tretry"
  s.add_development_dependency "tzinfo-data"
  s.add_development_dependency "webdrivers", ">= 5.3.1"

  # Needed to make Ruby 3 work on CI
  s.add_development_dependency "minitest", ">= 5.15"
  s.add_development_dependency "sexp_processor", ">= 4.16.0"
end
