module ApiMaker::SpecHelper::WaitForSelector
  def wait_for_selector(selector, *, **)
    expect(page).to have_selector(selector, *, **)
    expect_no_browser_errors
  rescue ::RSpec::Expectations::ExpectationNotMetError => e
    expect_no_browser_errors
    raise ::ApiMaker::SpecHelper::SelectorNotFoundError, e.message
  end

  def wait_for_selectors(*selectors)
    selectors.each do |selector|
      wait_for_selector(selector)
    end
  end

  def wait_for_no_selector(selector, *, **)
    expect(page).to have_no_selector(selector, *, **)
    expect_no_browser_errors
  rescue ::RSpec::Expectations::ExpectationNotMetError => e
    expect_no_browser_errors
    raise ::ApiMaker::SpecHelper::SelectorFoundError, e.message
  end

  def wait_for_order_of_elements(selector, callback, expected_order)
    wait_for_expect do
      order = all(selector).map { |element| callback.call(element) }
      expect(order).to eq expected_order
    end
  end
end
