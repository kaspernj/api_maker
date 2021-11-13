require "money-rails"

Money.locale_backend = :i18n

Rails.configuration.to_prepare do
  MoneyRails.configure do |config|
    # Specify a rounding mode
    # Any one of:
    #
    # BigDecimal::ROUND_UP,
    # BigDecimal::ROUND_DOWN,
    # BigDecimal::ROUND_HALF_UP,
    # BigDecimal::ROUND_HALF_DOWN,
    # BigDecimal::ROUND_HALF_EVEN,
    # BigDecimal::ROUND_CEILING,
    # BigDecimal::ROUND_FLOOR
    #
    # set to BigDecimal::ROUND_HALF_EVEN by default
    #
    config.rounding_mode = BigDecimal::ROUND_HALF_UP
  end
end
