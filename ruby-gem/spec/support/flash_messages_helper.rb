module FlashMessagesHelper
  def flash_message_text
    all("[data-testid='notification-message']").map(&:text)
  rescue Selenium::WebDriver::Error::StaleElementReferenceError
    retry
  end
end
