require_relative "boot"

require "rails"
# Pick the frameworks you want:
require "active_model/railtie"
require "active_job/railtie"
require "active_record/railtie"
require "active_storage/engine"
require "action_controller/railtie"
require "action_mailer/railtie"
require "action_view/railtie"
require "action_cable/engine"
require "sprockets/railtie"
# require "rails/test_unit/railtie"

Bundler.require(*Rails.groups)

require "dotenv-rails"
Dotenv::Railtie.load

require "active_record_query_fixer"
require "api_maker"
require "cancancan"
require "devise"
require "js-routes"
require "kaminari" if Gem.loaded_specs["kaminari"]
require "will_paginate" if Gem.loaded_specs["will_paginate"]

module Dummy; end

class Dummy::Application < Rails::Application
  # Initialize configuration defaults for originally generated Rails version.
  config.load_defaults 5.2

  # Settings in config/environments/* take precedence over those specified here.
  # Application configuration can go into files in config/initializers
  # -- all .rb files in that directory are automatically loaded after loading
  # the framework and any gems in your application.

  config.i18n.available_locales = [:da, :en]
  config.i18n.default_locale = :en
  config.i18n.load_path += Dir[Rails.root.join("config/locales/**/*.yml").to_s]

  config.hosts << "peakflow.development"
end
