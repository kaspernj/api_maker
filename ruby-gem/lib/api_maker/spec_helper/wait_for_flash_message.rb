module ApiMaker::SpecHelper::WaitForFlashMessage
  def wait_for_flash_message(expected_message, delay_sec: 0.2, timeout_sec: 6)
    received_messages = []

    WaitUtil.wait_for_condition("wait for flash message", timeout_sec:, delay_sec:) do
      expect_no_browser_errors
      current_messages = flash_message_text
      current_messages = [current_messages] unless current_messages.is_a?(Array)
      received_messages += current_messages

      if expected_message.is_a?(Regexp)
        current_messages.any? { |current_message| expected_message.match?(current_message) }
      else
        current_messages.include?(expected_message)
      end
    end

    expect_no_browser_errors
  rescue WaitUtil::TimeoutError
    expect(received_messages.uniq.reject(&:blank?)).to eq include expected_message # rubocop:disable Rails/CompactBlank
  end
end
