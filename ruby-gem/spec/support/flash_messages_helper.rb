module FlashMessagesHelper
  def flash_message_text
    all("[data-class='notification-message']").map(&:text)
  rescue Selenium::WebDriver::Error::StaleElementReferenceError
    retry
  end
end
