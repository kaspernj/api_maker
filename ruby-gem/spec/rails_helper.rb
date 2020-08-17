# This file is copied to spec/ when you run 'rails generate rspec:install'
require "spec_helper"
ENV["RAILS_ENV"] ||= "test"
require_relative "dummy/config/environment"
# Prevent database truncation if the environment is production
abort("The Rails environment is running in production mode!") if Rails.env.production?
require "rspec/rails"
# Add additional requires below this line. Rails is not loaded until this point!

# Delete cache to force Webpacker to compile
path = Rails.root.join("tmp/cache").to_s
FileUtils.rm_rf(path)

require "money-rails"
MoneyRails::Hooks.init

require "active_record_better_dependent_error_messages"
require "cancancan"
require "devise"
require "factory_bot_rails"
require "js-routes"
require "pry-rails"
require "public_activity"
require "puma"
require "rspec/retry" if ENV["CI"]
require "waitutil"
require "webdrivers"
require "webpacker"

Webdrivers::Chromedriver.required_version = ENV["CHROME_DRIVER_VERSION"].presence || "80.0.3987.16"

# Requires supporting ruby files with custom matchers and macros, etc, in
# spec/support/ and its subdirectories. Files matching `spec/**/*_spec.rb` are
# run as spec files by default. This means that files in spec/support that end
# in _spec.rb will both be required and run as specs, causing the specs to be
# run twice. It is recommended that you do not name files matching this glob to
# end with _spec.rb. You can configure this pattern with the --pattern
# option on the command line or in ~/.rspec, .rspec or `.rspec-local`.
#
# The following line is provided for convenience purposes. It has the downside
# of increasing the boot-up time by auto-requiring all files in the support
# directory. Alternatively, in the individual `*_spec.rb` files, manually
# require only the support files necessary.
#
Dir[File.join(__dir__, "support", "**", "*.rb")].sort.each { |f| require f }

# Checks for pending migrations and applies them before tests are run.
# If you are not using ActiveRecord, you can remove this line.
# ActiveRecord::Migration.maintain_test_schema!

Capybara.server = :puma, {Silent: true}

RSpec.configure do |config|
  config.include ApiMaker::SpecHelper
  config.include FlashMessagesHelper, type: :system
  config.include FactoryBot::Syntax::Methods
  config.include Warden::Test::Helpers

  config.backtrace_exclusion_patterns << /\/\.rvm\//
  config.infer_spec_type_from_file_location!
  config.filter_rails_from_backtrace!
  config.use_transactional_fixtures = true

  if ENV["CI"]
    # RSpec retry
    config.display_try_failure_messages = true
    config.verbose_retry = true

    config.around :each, :retry do |example|
      example.run_with_retry retry: 3
    end

    # Callback to be run between retries
    config.retry_callback = proc do |ex|
      # Run some additional clean up task - can be filtered by example metadata
      Capybara.reset! if ex.metadata[:type] == :system
    end

    # Timeout after some time to avoid freezes
    config.around do |example|
      Timeout.timeout(30) do
        example.run
      end
    end
  end

  config.prepend_before(:each, type: :system) do
    if ENV["SELENIUM_DRIVER"] == "firefox"
      driven_by :selenium, using: :firefox
    else
      driven_by :selenium,
        using: :chrome,
        options: {
          args: %w[disable-dev-shm-usage disable-gpu headless no-sandbox]
        },
        screen_size: [1920, 1200]
    end
  end

  config.before(:suite) do
    Warden.test_mode!
    ApiMaker::ModelsGeneratorService.execute!
  end

  config.before do
    Capybara.reset_sessions!
    Warden.test_reset!
  end

  config.before(:each, system: true) do
    browser_logs # Clear the logs
  end
end
