class ApiMaker::WaitForSelector < ApiMaker::ApplicationService
  attr_accessor :last_error
  attr_reader :args, :context, :selector

  delegate :expect, :expect_no_browser_errors, :have_selector, :page, :wait_for_browser, to: :context

  def initialize(args:, context:, selector:)
    @args = args
    @context = context
    @selector = selector
  end

  def execute
    wait_for_browser do
      run_expectation
    end

    succeed!
  rescue WaitUtil::TimeoutError => e
    raise ApiMaker::SpecHelper::SelectorNotFoundError, e.message if last_error.is_a?(RSpec::Expectations::ExpectationNotMetError)
    raise e
  end

  def run_expectation
    expect(page).to have_selector selector, *args
    expect_no_browser_errors
    true
  rescue RSpec::Expectations::ExpectationNotMetError => e
    expect_no_browser_errors
    self.last_error = e
    false
  end
end
