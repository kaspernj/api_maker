module ApiMaker::SpecHelper::WaitForExpect
  # Waits for an expect to not fail - this is great because it whines
  #
  # Forwards keyword arguments (e.g. +timeout_sec:+) to +wait_for_browser+;
  # without the explicit +**kwargs+ they would be collected into +*args+ as a
  # positional Hash on Ruby 3.x and blow up the keyword-only +wait_for_browser+.
  def wait_for_expect(*args, **kwargs)
    last_error = nil

    begin
      wait_for_browser(*args, **kwargs) do
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
