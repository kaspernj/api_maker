module FlashMessagesHelper
  def flash_message_text
    find(".ui-pnotify-text").text
  rescue Capybara::ElementNotFound # rubocop:disable Lint/SuppressedException
    # Ignore - its ok that no flash message is shown
  end
end
