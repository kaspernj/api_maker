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
# require "sprockets/railtie"
# require "rails/test_unit/railtie"

Bundler.require(*Rails.groups)

require "dotenv-rails"
Dotenv::Railtie.load

# Fixes autoload issues when booting up dummy in dev env
module ApiHelpers; end
require_relative "../../../app/api_maker/api_helpers/api_maker_helpers"

require "active_record_query_fixer"
require "api_maker"
require "api_maker_table"
require "cancancan"
require "devise"
require "js-routes"

module Dummy; end

class Dummy::Application < Rails::Application
  # Initialize configuration defaults for originally generated Rails version.
  config.load_defaults 7.0

  # Settings in config/environments/* take precedence over those specified here.
  # Application configuration can go into files in config/initializers
  # -- all .rb files in that directory are automatically loaded after loading
  # the framework and any gems in your application.

  config.i18n.available_locales = [:da, :en]
  config.i18n.default_locale = :en
  config.i18n.load_path += Dir[Rails.root.join("config/locales/**/*.yml").to_s]

  config.hosts << ENV.fetch("ALLOWED_HOST") if ENV["ALLOWED_HOST"].present?
end
