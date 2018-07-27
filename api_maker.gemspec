$:.push File.expand_path("lib", __dir__)

# Maintain your gem's version:
require "api_maker/version"

# Describe your gem and declare its dependencies:
Gem::Specification.new do |s|
  s.name        = "api_maker"
  s.version     = ApiMaker::VERSION
  s.authors     = ["kjabtion"]
  s.email       = ["kj@abtion.com"]
  s.homepage    = "TODO"
  s.summary     = "TODO: Summary of ApiMaker."
  s.description = "TODO: Description of ApiMaker."
  s.license     = "MIT"

  s.files = Dir["{app,config,db,lib}/**/*", "MIT-LICENSE", "Rakefile", "README.md"]

  s.add_dependency "rails", "~> 5.2.0"

  s.add_development_dependency "sqlite3"
end
