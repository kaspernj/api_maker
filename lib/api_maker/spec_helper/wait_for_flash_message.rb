module ApiMaker::SpecHelper::WaitForFlashMessage
  def wait_for_flash_message(expected_message, delay_sec: 0.2, timeout_sec: 6)
    received_messages = []

    WaitUtil.wait_for_condition("wait for flash message", timeout_sec: timeout_sec, delay_sec: delay_sec) do
      expect_no_browser_errors
      current_message = flash_message_text
      received_messages << current_message
      current_message == expected_message
    end

    expect_no_browser_errors
  rescue WaitUtil::TimeoutError
    expect(received_messages.uniq.reject(&:blank?)).to eq include expected_message
  end
end
