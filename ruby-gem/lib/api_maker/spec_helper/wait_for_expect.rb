module ApiMaker::SpecHelper::WaitForExpect
  # Waits for an expect to not fail - this is great because it whines
  def wait_for_expect
    last_error = nil

    begin
      wait_for_browser do
        yield
        true
      rescue RSpec::Expectations::ExpectationNotMetError => e
        last_error = e
        false
      end
    rescue WaitUtil::TimeoutError => e
      raise last_error if last_error

      raise e
    end
  end
end
